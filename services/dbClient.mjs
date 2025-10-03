import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const docClient = new DynamoDBClient({
	region: process.env.AWS_REGION || "eu-north-1",
});

const client = DynamoDBDocumentClient.from(docClient);

const TableName = process.env.TABLE_NAME;

if (!TableName) {
	throw new Error("DYNAMODB_TABLE env var is not set.");
}

export { client, TableName };
