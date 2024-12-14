import { handleAIChatRequest } from "./aiChat";

export const aiServerRoute = async (req, res) => {
  const { url } = req;

  if (url.pathname.endsWith("/chat")) {
    return handleAIChatRequest(req, res);
  }
};
