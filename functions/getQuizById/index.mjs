import middy from "@middy/core";
import httpErrorHandler from "@middy/http-error-handler";
import validator from "@middy/validator";
import { transpileSchema } from "@middy/validator/transpile";
import { QueryCommand } from "@aws-sdk/client-dynamodb";
import { client } from "../../services/dbClient.mjs";
import { getQuizByIdSchema } from "../../schemas/getQuizByIdSchema.mjs";

const getQuizById = async (event) => {
	const quizId = event.pathParameters?.quizId;
	if (!quizId) {
		const error = new Error("Quiz id is missing.");
		error.statusCode = 400;
		throw error;
	}

	//quiz+questions query
	const res = await client.send(
		new QueryCommand({
			TableName: process.env.TABLE_NAME,
			KeyConditionExpression: "pk = :pk",
			ExpressionAttributeValues: { ":pk": { S: `QUIZ#${quizId}` } },
		})
	);

	const items = res.Items;

	//quiz item
	const quiz = items.find((item) => item.sk?.S === "PROFILE");
	if (!quiz) {
		const error = new Error("Quiz not found.");
		error.statusCode = 404;
		throw error;
	}
	const quizName = quiz.quizName?.S;

	//question items
	const questions = items
		.filter((item) => item.sk?.S?.startsWith("QUESTION#"))
		.map((item) => ({
			// extract questionId from SK
			questionId: item.sk.S.replace("QUESTION#", ""),
			question: item.question?.S,
			answer: item.answer?.S,
			lat: item.lat?.S,
			long: item.long?.S,
		}));

	return {
		statusCode: 200,
		body: JSON.stringify({
			quizId,
			quizName,
			questions,
		}),
	};
};

export const handler = middy()
	.use(validator({ eventSchema: transpileSchema(getQuizByIdSchema) }))
	.use(httpErrorHandler())
	.handler(getQuizById);
