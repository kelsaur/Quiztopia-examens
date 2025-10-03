export const getQuizByIdSchema = {
	type: "object",
	required: ["pathParameters"],
	properties: {
		pathParameters: {
			type: "object",
			required: ["quizId"],
			properties: {
				quizId: { type: "string" },
			},
		},
	},
};
