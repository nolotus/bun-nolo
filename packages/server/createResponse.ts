export function createResponse() {
	let response: Response | null = null;
	let statusCode: number = 200;
	let headers: Headers = new Headers();
	function json(data: object) {
		headers.set("Content-Type", "application/json");
		// Add CORS headers
		headers.set("Access-Control-Allow-Origin", "*");
		headers.set(
			"Access-Control-Allow-Methods",
			"OPTIONS, GET, POST, PUT, DELETE",
		);
		headers.set(
			"Access-Control-Allow-Headers",
			"Content-Type, Authorization, Accept, X-Requested-With",
		);
		headers.set("Access-Control-Max-Age", "1800");
		headers.set("X-Frame-Options", "DENY");
		headers.set("X-XSS-Protection", "1; mode=block");

		response = new Response(JSON.stringify(data), {
			status: statusCode,
			headers: headers,
		});
		return response;
	}

	function status(code: number) {
		statusCode = code;
		return {
			response,
			status,
			json,
			setHeader,
			write,
			end,
		};
	}

	function setHeader(name: string, value: string) {
		headers.set(name, value);
		return response;
	}

	function write(data: string) {
		if (response) {
			let text = response.body ? response.body.toString() + data : data;
			response = new Response(text, {
				status: statusCode,
				headers: headers,
			});
		}
		return response;
	}

	function end() {
		return response;
	}

	return {
		response,
		status,
		json,
		setHeader,
		write,
		end,
	};
}
