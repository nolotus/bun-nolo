import { type FC, createContext, useEffect, useState } from "react";

interface WebSocketProviderProps {
  url: string;
}

interface WebSocketContextType {
  websocket: WebSocket | null;
  data: string;
}

export const WebSocketContext = createContext<WebSocketContextType>({
  websocket: null,
  data: "",
});

export const WebSocketProvider: FC<WebSocketProviderProps> = ({
  url,
  children,
}) => {
  const [websocket, setWebSocket] = useState<WebSocket | null>(null);
  const [data, setData] = useState("");

  useEffect(() => {
    const newWebSocket = new WebSocket(url);
    newWebSocket.onopen = () => {};
    newWebSocket.onclose = () => {};
    newWebSocket.onmessage = (event) => {
      const message = event.data;
      setData(message);
    };

    setWebSocket(newWebSocket);

    return () => {
      newWebSocket.close();
    };
  }, [url]);

  const contextValue: WebSocketContextType = {
    websocket,
    data,
  };

  return <WebSocketContext value={contextValue}>{children}</WebSocketContext>;
};
