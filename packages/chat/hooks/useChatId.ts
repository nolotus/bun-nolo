import { useSearchParams } from 'react-router-dom';

const useChatId = () => {
  const [searchParams] = useSearchParams();
  const chatId = searchParams.get('chatId');
  return chatId;
};

export default useChatId;
