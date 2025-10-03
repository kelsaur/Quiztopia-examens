export const createQuestionSchema = {
	type: "object",
	required: ["body", "pathParameters"],
	properties: {
		pathParameters: {
			type: "object",
			required: ["quizId"],
			properties: {
				quizId: { type: "string", minLength: 1 },
			},
		},
		body: {
			type: "object",
			required: ["question", "answer", "lat", "long"],
			additionalProperties: false,
			properties: {
				question: { type: "string", minLength: 1 },
				answer: { type: "string", minLength: 1 },
				lat: { type: "string" },
				long: { type: "string" },
			},
		},
	},
};
