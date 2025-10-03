export const createAccountSchema = {
	type: "object",
	required: ["body"],
	properties: {
		body: {
			type: "object",
			required: ["username", "email", "password"],
			properties: {
				username: { type: "string", minLength: 6 },
				email: { type: "string", format: "email" },
				password: { type: "string", minLength: 6 },
			},
		},
	},
};
