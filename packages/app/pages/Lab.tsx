import { tokenizeMarkdown } from "render/prase/tokenizeMarkdown";
import { WebSocketContext } from "app/providers/WebSocketProvider";
import React, { useContext, useState } from "react";
import Button from "render/ui/Button";
import ThemeSwitcher from "../theme/ThemeSwitcher";

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

  const tokens = tokenizeMarkdown(markdownText);
  const elements = renderTokens(tokens);

  const simulateLoading = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

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
        <ThemeSwitcher />

        <h2>Button Demos</h2>

        <h3>Basic Buttons</h3>
        <Button type="button">Default Button</Button>
        <Button type="submit">Submit Button</Button>
        <Button type="reset">Reset Button</Button>

        <h3>Disabled Buttons</h3>
        <Button type="button" disabled>
          Disabled Button
        </Button>
        <Button type="submit" disabled>
          Disabled Submit
        </Button>

        <h3>Loading Buttons</h3>
        <Button type="button" loading={loading} onClick={simulateLoading}>
          {loading ? "Loading..." : "Click to Load"}
        </Button>

        <h3>Buttons with Icons</h3>
        <Button type="button" icon={<span>🚀</span>}>
          Launch
        </Button>
        <Button type="button" icon={<span>📎</span>}>
          Attach
        </Button>

        <h3>Different Widths</h3>
        <Button type="button" width="100px">
          100px Width
        </Button>
        <Button type="button" width="50%">
          50% Width
        </Button>

        <h3>Custom Styled Button</h3>
        <Button
          type="button"
          className="custom-button"
          style={{ backgroundColor: "purple", color: "white" }}
        >
          Custom Style
        </Button>

        <h3>Combination</h3>
        <Button
          type="submit"
          loading={loading}
          icon={<span>✉️</span>}
          onClick={simulateLoading}
          width="200px"
        >
          {loading ? "Sending..." : "Send Email"}
        </Button>
      </>
    </div>
  );
};

export default Lab;
