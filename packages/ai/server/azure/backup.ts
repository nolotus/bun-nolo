import axios from 'axios';

export const getGpt35TurboChatCompletion = async (messages) => {
  const endpoint = '';
  const apiKey = '';

  const url = `${endpoint}/openai/deployments/gpt35/chat/completions?api-version=2023-07-01-preview`;
  const headers = {
    'Content-Type': 'application/json',
    'api-key': apiKey,
  };
  const data = {
    messages,
    stream: true,
  };

  try {
    const response = await axios.post(url, data, { headers });
    return response.data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

// // 调用函数并处理返回结果
// getGpt35TurboChatCompletion()
//   .then((result) => {
//     console.log('Response:', result);
//     // 在这里处理返回的结果
//   })
//   .catch((error) => {
//     console.error('Error:', error);
//     // 在这里处理错误
//   });
