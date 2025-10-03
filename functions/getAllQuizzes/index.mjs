import middy from "@middy/core";
import httpErrorHandler from "@middy/http-error-handler";
import { QueryCommand } from "@aws-sdk/client-dynamodb";
import { client } from "../../services/dbClient.mjs";

const getAllQuizzes = async () => {
	//GSI query for all quizzes
	const res = await client.send(
		new QueryCommand({
			TableName: process.env.TABLE_NAME,
			IndexName: "GSI1",
			KeyConditionExpression: "GSI1pk = :g",
			ExpressionAttributeValues: {
				":g": { S: "QUIZZES" },
			},
		})
	);

	const items = res.Items;

	const quizzes = items.map((it) => ({
		quizId: it.quizId?.S,
		quizName: it.quizName?.S,
		ownerUsername: it.ownerUsername?.S,
	}));

	return {
		statusCode: 200,
		body: JSON.stringify({ quizzes }),
	};
};

export const handler = middy().use(httpErrorHandler()).handler(getAllQuizzes);
