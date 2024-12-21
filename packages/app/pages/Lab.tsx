import { WebSocketContext } from "app/providers/WebSocketProvider";
import React, { useContext, useState } from "react";
import ThemeSwitcher from "../theme/ThemeSwitcher";

const Lab = () => {
	const { websocket, data } = useContext(WebSocketContext);
	const [message, setMessage] = useState("");
	const [loading, setLoading] = useState(false);

	const sendMessage = () => {
		if (message && websocket) {
			websocket.send(message);
			setMessage("");
		}
	};

	const renderTokens = (datas) => {
		return datas.map(() => {
			return <div>xxx</div>;
		});
	};

	const simulateLoading = () => {
		setLoading(true);
		setTimeout(() => setLoading(false), 2000);
	};

	return (
		<div>
			<h1>Received Data:</h1>
			<p>{data}</p>
			<input
				type="text"
				value={message}
				onChange={(e) => setMessage(e.target.value)}
			/>
			<button onClick={sendMessage}>Send</button>
			<ThemeSwitcher />
		</div>
	);
};

export default Lab;
