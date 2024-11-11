export const runCybotTool = {
  type: "function",
  function: {
    name: "run_cybot",
    description: "根据对话可以找到合适的cybotId ，进行运行",
    parameters: {
      type: "object",
      properties: {
        cybotId: {
          type: "string",
          description: "The Id of the Cybot",
        },
      },
      required: ["cybotId"],
    },
  },
};

export const runCybot = async (params) => {
  console.log("runCybot", params);
  return params.cybotId;
};
