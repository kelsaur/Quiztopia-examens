import middy from "@middy/core";
import httpJsonBodyParser from "@middy/http-json-body-parser";
import httpErrorHandler from "@middy/http-error-handler";
import validator from "@middy/validator";
import { transpileSchema } from "@middy/validator/transpile";
import {
	GetItemCommand,
	QueryCommand,
	DeleteItemCommand,
} from "@aws-sdk/client-dynamodb";
import { client } from "../../services/dbClient.mjs";
import { deleteQuizSchema } from "../../schemas/deleteQuizSchema.mjs";
import { validateToken } from "../../middlewares/index.mjs";

const deleteQuiz = async (event) => {
	const quizId = event.pathParameters?.quizId;
	if (!quizId) {
		const error = new Error("Quiz id is missing.");
		error.statusCode = 400;
		throw error;
	}

	const username = event.user?.username;
	if (!username) {
		const error = new Error("Unauthorized");
		error.statusCode = 401;
		throw error;
	}

	//fetch quiz
	const quiz = await client.send(
		new GetItemCommand({
			TableName: process.env.TABLE_NAME,
			Key: { pk: { S: `QUIZ#${quizId}` }, sk: { S: "PROFILE" } },
		})
	);
	if (!quiz.Item) {
		const error = new Error("Quiz not found.");
		error.statusCode = 404;
		throw error;
	}

	//check who's the owner
	const owner = quiz.Item.ownerUsername?.S;
	if (owner !== username) {
		const error = new Error("Forbidden. Not your quiz!");
		error.statusCode = 403;
		throw error;
	}

	//fetch quiz + questions, delete them
	const question = await client.send(
		new QueryCommand({
			TableName: process.env.TABLE_NAME,
			KeyConditionExpression: "pk = :pk",
			ExpressionAttributeValues: { ":pk": { S: `QUIZ#${quizId}` } },
		})
	);
	const items = question.Items;
	for (const item of items) {
		await client.send(
			new DeleteItemCommand({
				TableName: process.env.TABLE_NAME,
				Key: { pk: item.pk, sk: item.sk },
			})
		);
	}

	return {
		statusCode: 200,
		body: JSON.stringify({ message: "Quiz deleted." }),
	};
};

export const handler = middy()
	.use(httpJsonBodyParser())
	.use(validator({ eventSchema: transpileSchema(deleteQuizSchema) }))
	.use(validateToken())
	.use(httpErrorHandler())
	.handler(deleteQuiz);
