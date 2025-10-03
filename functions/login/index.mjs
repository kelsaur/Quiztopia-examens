import { client } from "../../services/dbClient.mjs";
import middy from "@middy/core";
import httpJsonBodyParser from "@middy/http-json-body-parser";
import httpErrorHandler from "@middy/http-error-handler";
import validator from "@middy/validator";
import { transpileSchema } from "@middy/validator/transpile";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { GetItemCommand } from "@aws-sdk/client-dynamodb";
import { loginSchema } from "../../schemas/loginSchema.mjs";

const logIn = async (event) => {
	const { username, password } = event.body;

	//find user in db
	const findUser = await client.send(
		new GetItemCommand({
			TableName: process.env.TABLE_NAME,
			Key: { pk: { S: `USER#${username}` }, sk: { S: "PROFILE" } },
		})
	);
	if (!findUser.Item) {
		const error = new Error("Can't find user with this name.");
		error.statusCode = 401;
		throw error;
	}

	//check if pw is correct, .S -> undefined if missing
	const hash = findUser.Item.hashedPassword?.S;
	const passwordMatch = hash && (await bcrypt.compare(password, hash));
	if (!passwordMatch) {
		const error = new Error("Invalid credentials.");
		error.statusCode = 401;
		throw error;
	}
	if (!process.env.JWT_SECRET) {
		const error = new Error("JWT_SECRET missing.");
		error.statusCode = 500;
		throw error;
	}

	//sign
	const token = jwt.sign({ username }, process.env.JWT_SECRET, {
		expiresIn: "3h",
	});

	return {
		statusCode: 200,
		body: JSON.stringify({ token, username }),
	};
};

export const handler = middy()
	.use(httpJsonBodyParser())
	.use(validator({ eventSchema: transpileSchema(loginSchema) }))
	.use(httpErrorHandler())
	.handler(logIn);
