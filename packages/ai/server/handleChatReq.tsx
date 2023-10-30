export const handleChatReq = async (req, res) => {
  console.log('handleChatReq', req);
  //   const openAIHeaders = getOpenAIHeaders();
  //   const proxyConfig = getProxyAxiosConfig();
  //   const requestBody: FrontEndRequestBody = req.body;
  //   const config: AxiosRequestConfig = {
  //     ...proxyConfig,
  //     headers: openAIHeaders,
  //     method: 'POST',
  //     responseType: 'stream',
  //     url: 'https://api.openai.com/v1/chat/completions',
  //     data: {
  //       model: requestBody.model,
  //       messages: requestBody.messages,
  //       stream: true,
  //     },
  //   };
  //   try {
  //     const response = await axios.request(config);
  //     let res = createResponse();
  //     return handleStreamEvents(response, res);
  //   } catch (error) {
  //     console.log(error.message);
  //   }
};
