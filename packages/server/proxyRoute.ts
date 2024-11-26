import { omit } from "rambda";

export const proxyRoute = async (req, res) => {
  const rawBody = req.body;
  console.log("rawBody", rawBody);

  const body = omit("url,KEY", rawBody);
  console.log("body", body);
  let headers;
  if (rawBody.model.includes("claude")) {
    console.log("it is claude");
    headers = {
      "Content-Type": "application/json",
      "x-api-key": rawBody.KEY,
      "anthropic-version": "2023-06-01",
    };
  } else {
    headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${rawBody.KEY}`,
    };
  }

  const response = await fetch(rawBody.url, {
    method: "POST",
    headers,
    body: JSON.stringify({
      ...body,
    }),
  });
  console.log("response", response);
  return new Response(response.body, {
    headers: { "Access-Control-Allow-Origin": "*" },
  });
};
