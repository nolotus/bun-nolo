export function getProxyConfig() {
	if (process.env.USE_PROXY === "true") {
		return {
			proxy: {
				protocol: "http",
				host: "127.0.0.1",
				port: 7890,
			},
		};
	}
}
