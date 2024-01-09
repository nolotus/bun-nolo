import { handleSyncRequest } from "user/server/sync";

import { handleLogin } from "./login";
import { handleRegister } from "./register";
export const authServerRoutes = (req, res) => {
	const { url } = req;
	switch (true) {
		case url.pathname.endsWith("/login"):
			return handleLogin(req, res);
		case url.pathname.endsWith("/register"):
			return handleRegister(req, res);
		case url.pathname.endsWith("/sync"):
			return handleSyncRequest(req, res);
		default:
			return new Response("user");
	}
};
