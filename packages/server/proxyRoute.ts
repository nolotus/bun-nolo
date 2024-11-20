import { omit } from "rambda";

export const proxyRoute = async (req, res) => {
  const rawBody = req.body;
  console.log("rawBody", rawBody);

  const body = omit("url,KEY", rawBody);
  console.log("body", body);

  const response = await fetch(rawBody.url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${rawBody.KEY}`,
    },
    body: JSON.stringify({
      ...body,
    }),
  });
  return response;
};
