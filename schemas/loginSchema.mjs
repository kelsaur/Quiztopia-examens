export const loginSchema = {
	type: "object",
	required: ["body"],
	properties: {
		body: {
			type: "object",
			required: ["username", "password"],
			additionalProperties: false,
			properties: {
				username: { type: "string", minLength: 6 },
				password: { type: "string", minLength: 6 },
			},
		},
	},
};
