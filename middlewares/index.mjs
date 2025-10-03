import jwt from "jsonwebtoken";

export const validateToken = () => {
	return {
		before: (request) => {
			const headers = request.event.headers;
			console.log("headers:", request.event.headers);

			const authHeader = headers.authorization || headers.Authorization;

			if (!authHeader) {
				throw Object.assign(new Error("No token"), { statusCode: 401 });
			}

			const token = authHeader.replace("Bearer ", "");
			if (!token) throw Error("No token");
			try {
				const data = jwt.verify(token, process.env.JWT_SECRET);
				request.event.user = data; //payload, decoded
			} catch (error) {
				throw Object.assign(new Error("ACCESS DENIED"), { statusCode: 401 });
			}
		},
	};
};
