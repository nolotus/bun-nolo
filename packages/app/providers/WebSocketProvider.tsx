import React, { createContext, useState, useEffect, FC } from "react";

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

    newWebSocket.onopen = () => {
      console.log("WebSocket Connected");
    };

    newWebSocket.onclose = () => {
      console.log("WebSocket Disconnected");
    };

    newWebSocket.onmessage = (event) => {
      const message = event.data;
      setData(message);
      console.log("Received message: ", message);
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

  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
    </WebSocketContext.Provider>
  );
};
