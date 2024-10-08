import { tokenizeMarkdown } from "render/prase/tokenizeMarkdown";
import { WebSocketContext } from "app/providers/WebSocketProvider";
import React, { useContext, useState } from "react";
import Button from "./Button";
const markdownText = `
# Title
Here is an ![alt text](http://example.com/image.jpg "Title").
## Another Title
Images can likewise be on their own line:
![alt](http://example.com/another-image.jpg)
`;
const Lab = () => {
  const { websocket, data } = useContext(WebSocketContext);
  const [message, setMessage] = useState("");

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
  const tokens = tokenizeMarkdown(markdownText);

  const elements = renderTokens(tokens);

  return (
    <div>
      {elements}
      <>
        <h1>Received Data:</h1>
        <p>{data}</p>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button onClick={sendMessage}>Send</button>

        <Button type="button">Button</Button>
        <Button type="submit">Submit</Button>
        <Button type="reset">Reset</Button>
        <Button type="button" disabled>
          Disabled Button
        </Button>
      </>
    </div>
  );
};
export default Lab;
