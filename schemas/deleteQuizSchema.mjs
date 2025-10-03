export const deleteQuizSchema = {
	type: "object",
	required: ["pathParameters"],
	properties: {
		pathParameters: {
			type: "object",
			required: ["quizId"],
			properties: {
				quizId: { type: "string", minLength: 1 },
			},
		},
	},
};
