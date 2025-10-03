import { client } from "../../services/dbClient.mjs";
import middy from "@middy/core";
import httpJsonBodyParser from "@middy/http-json-body-parser";
import httpErrorHandler from "@middy/http-error-handler";
import validator from "@middy/validator";
import { transpileSchema } from "@middy/validator/transpile";
import bcrypt from "bcryptjs";
import { GetItemCommand, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { createAccountSchema } from "../../schemas/createAccountSchema.mjs";

export const createAccount = async (event) => {
	const { username, email, password } = event.body;
	const passwordHash = await bcrypt.hash(password, 12);

	//check if username already exists
	const existing = await client.send(
		new GetItemCommand({
			TableName: process.env.TABLE_NAME,
			Key: { pk: { S: `USER#${username}` }, sk: { S: "PROFILE" } },
		})
	);
	if (existing.Item) {
		const error = new Error("Username already exists. Choose another one.");
		error.statusCode = 409;
		throw error;
	}

	//create account
	await client.send(
		new PutItemCommand({
			TableName: process.env.TABLE_NAME,
			Item: {
				pk: { S: `USER#${username}` },
				sk: { S: "PROFILE" },
				username: { S: username },
				email: { S: email },
				hashedPassword: { S: passwordHash },
			},
		})
	);

	return {
		statusCode: 201,
		body: JSON.stringify({ message: `Account created, welcome ${username}!` }),
	};
};

export const handler = middy()
	.use(httpJsonBodyParser())
	.use(validator({ eventSchema: transpileSchema(createAccountSchema) }))
	.use(httpErrorHandler())
	.handler(createAccount);
