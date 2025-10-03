import middy from "@middy/core";
import httpJsonBodyParser from "@middy/http-json-body-parser";
import httpErrorHandler from "@middy/http-error-handler";
import validator from "@middy/validator";
import { transpileSchema } from "@middy/validator/transpile";
import { PutItemCommand } from "@aws-sdk/client-dynamodb";
import { v4 as uuidv4 } from "uuid";
import { client } from "../../services/dbClient.mjs";
import { createQuizSchema } from "../../schemas/createQuizSchema.mjs";
import { validateToken } from "../../middlewares/index.mjs";

const createQuiz = async (event) => {
	const { quizName } = event.body;
	const { username } = event.user;
	if (!username) {
		const error = new Error("Unauthorized");
		error.statusCode = 401;
		throw error;
	}

	const quizId = uuidv4();

	await client.send(
		new PutItemCommand({
			TableName: process.env.TABLE_NAME,
			Item: {
				pk: { S: `QUIZ#${quizId}` },
				sk: { S: "PROFILE" },
				quizId: { S: quizId },
				quizName: { S: quizName },
				ownerUsername: { S: username }, //JWT
				GSI1pk: { S: "QUIZZES" }, //GET /quizzes
			},
		})
	);

	return {
		statusCode: 201,
		body: JSON.stringify({ quizId, quizName, ownerUsername: username }),
	};
};

export const handler = middy()
	.use(httpJsonBodyParser())
	.use(validator({ eventSchema: transpileSchema(createQuizSchema) }))
	.use(validateToken())
	.use(httpErrorHandler())
	.handler(createQuiz);
