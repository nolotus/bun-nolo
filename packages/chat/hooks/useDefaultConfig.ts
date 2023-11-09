import { useAppDispatch } from 'app/hooks';
import { useLazyGetEntryQuery } from 'database/services';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { fetchDefaultConfig } from '../chatSlice';

export const useDefaultConfig = (chatId: string) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [getDefaultConfig] = useLazyGetEntryQuery();

  useEffect(() => {
    const requestDefaultConfig = async () => {
      if (chatId) {
        const chatIdConfig = await getDefaultConfig({
          entryId: chatId,
        }).unwrap();
        console.log('chatIdConfig', chatIdConfig);
        if (chatIdConfig.error?.status === 404) {
          navigate('/chat');
        } else {
          dispatch(fetchDefaultConfig(chatIdConfig));
        }
      }
    };
    requestDefaultConfig();
  }, [chatId, dispatch, getDefaultConfig, navigate]);
};
