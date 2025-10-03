export const createQuizSchema = {
	type: "object",
	required: ["body"],
	properties: {
		body: {
			type: "object",
			required: ["quizName"],
			additionalProperties: false,
			properties: {
				quizName: { type: "string", minLength: 1, maxLength: 100 },
			},
		},
	},
};
