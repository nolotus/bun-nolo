import { useDeleteEntryMutation } from 'database/services';

export const useDeleteChat = (postReloadChatList) => {
  const [deleteEntry] = useDeleteEntryMutation();

  const deleteChatBot = async (chat) => {
    await deleteEntry({ entryId: chat.id }).unwrap();
    console.log('delete ok');
    postReloadChatList();
  };

  return deleteChatBot;
};
