import {useState, useEffect} from 'react';
import {getUserId} from 'auth/client/token';
import {useStore} from 'app';
import {nolotusId} from 'core/init';
import {queryData} from 'database/client/query';

const queryConfigs = async (isNolotus = false, userId = null) => {
  const options = {
    isJSON: true,
    condition: {
      $eq: {type: 'chatRobot'},
    },
    limit: 20,
  };

  return await queryData(isNolotus ? nolotusId : userId, options);
};

const mergeConfigs = (nolotusConfigs, userConfigs) => {
  return Array.from(
    new Map(
      [...nolotusConfigs, ...userConfigs].map(item => [item.id, item]),
    ).values(),
  );
};

export const useChatData = (configId) => {
  const defaultConfig = useStore(configId); // 使用 useStore 获取 defaultConfig
  const [chatList, setChatList] = useState([]);
  const [config, setConfig] = useState(defaultConfig); // 初始化为 defaultConfig
  const [selectedChat, setSelectedChat] = useState(configId); // 新增状态

  useEffect(() => {
    const fetchData = async () => {
      const userId =getUserId()
      const [nolotusConfigs, userConfigs] = await Promise.all([
        queryConfigs(true),
        queryConfigs(false, userId),
      ]);
      console.log('nolotusConfigs',nolotusConfigs)
      console.log('userConfigs',userConfigs)

      const uniqueConfigs = mergeConfigs(nolotusConfigs, userConfigs);
      setChatList(uniqueConfigs);

      const selected = uniqueConfigs.find(chat => chat.id === configId);
      if (selected) {
        setSelectedChat(configId);
        setConfig(selected);
        const updatedChatList = [
          selected,
          ...uniqueConfigs.filter(c => c.id !== configId),
        ];
        setChatList(updatedChatList);
      } else if (uniqueConfigs && uniqueConfigs.length > 0) {
        setSelectedChat(uniqueConfigs[0].id); // 设置为第一个聊天的 ID
        setConfig(uniqueConfigs[0]);
      }
    };

    fetchData();
  }, [configId]);

  const reloadChatList = async () => {
    const [nolotusConfigs, userConfigs] = await Promise.all([
      queryConfigs(true),
      queryConfigs(false, userId),
    ]);

    const uniqueConfigs = mergeConfigs(nolotusConfigs, userConfigs);
    setChatList(uniqueConfigs);
  };

  const handleChatSelect = chat => {
    setSelectedChat(chat.id); // 设置为聊天的 ID
    setConfig(chat);

    // 将选中的聊天置顶
    const updatedChatList = chatList.reduce((acc, c) => {
      if (c.id === chat.id) {
        acc.unshift(c);
      } else {
        acc.push(c);
      }
      return acc;
    }, []);

    setChatList(updatedChatList);
  };

  return {
    chatList,
    config,
    setConfig,
    selectedChat,
    setSelectedChat,
    handleChatSelect,
    reloadChatList,
  };
};
