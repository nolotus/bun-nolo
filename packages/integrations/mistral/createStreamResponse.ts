export const fromMistralCreateStreamResponse = (stream) => {
	const textEncoder = new TextEncoder();
	const readableStream = new ReadableStream({
		start(controller) {
			stream.data.on("data", (chunk) => {
				console.log("chunk", chunk);
				const value = textEncoder.encode(chunk);
				console.log("value", value);

				controller.enqueue(value);
			});
			stream.data.on("end", () => {
				controller.close();
			});
		},
	});

	const responseHeaders = {
		"Content-Type": "text/event-stream",
		"Cache-Control": "no-cache",
		Connection: "keep-alive",
		"Access-Control-Allow-Origin": "*",
	};
	return new Response(readableStream, { headers: responseHeaders });
};
