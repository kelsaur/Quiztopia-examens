import middy from "@middy/core";
import httpJsonBodyParser from "@middy/http-json-body-parser";
import httpErrorHandler from "@middy/http-error-handler";
import validator from "@middy/validator";
import { transpileSchema } from "@middy/validator/transpile";
import { GetItemCommand, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { v4 as uuidv4 } from "uuid";
import { client } from "../../services/dbClient.mjs";
import { createQuestionSchema } from "../../schemas/createQuestionSchema.mjs";
import { validateToken } from "../../middlewares/index.mjs";

const createQuestion = async (event) => {
	const { question, answer, lat, long } = event.body;
	const quizId = event.pathParameters?.quizId;
	if (!quizId) {
		const error = new Error("Quiz id is missing.");
		error.statusCode = 400;
		throw error;
	}

	//auth user
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

	//check ownerr
	const owner = quiz.Item.ownerUsername?.S;
	if (owner !== username) {
		const error = new Error("Forbidden");
		error.statusCode = 403;
		throw error;
	}

	//save question
	const questionId = uuidv4();
	const item = {
		pk: { S: `QUIZ#${quizId}` },
		sk: { S: `QUESTION#${questionId}` },
		question: { S: question },
		answer: { S: answer },
		lat: { S: lat },
		long: { S: long },
		ownerUsername: { S: username },
	};

	await client.send(
		new PutItemCommand({
			TableName: process.env.TABLE_NAME,
			Item: item,
		})
	);

	return {
		statusCode: 201,
		body: JSON.stringify({ quizId, questionId }),
	};
};

export const handler = middy()
	.use(httpJsonBodyParser())
	.use(validator({ eventSchema: transpileSchema(createQuestionSchema) }))
	.use(validateToken())
	.use(httpErrorHandler())
	.handler(createQuestion);
