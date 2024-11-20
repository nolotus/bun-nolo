import { omit } from "rambda";

export const proxyRoute = async (req, res) => {
  const rawBody = req.body;

  const body = omit("url,KEY", rawBody);

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${rawBody.KEY}`,
  };

  const response = await fetch(rawBody.url, {
    method: "POST",
    headers,
    body: JSON.stringify({
      ...body,
    }),
  });
  return response;
};
