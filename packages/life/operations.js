import { deleteData } from 'database/client/delete';
import { syncData, syncDataFromNolotus } from 'database/client/sync';
import { updateData } from 'database/client/update';

export const handleOperations = async (
  operation,
  key,
  content,
  refreshData,
  userId,
) => {
  try {
    switch (operation) {
      case 'edit':
        // 编辑逻辑
        break;
      case 'save':
        await updateData(userId, content, key);
        console.log('Data updated successfully');
        refreshData();
        break;
      case 'delete':
        await deleteData(key);
        console.log('Data deleted successfully');
        refreshData();
        break;
      case 'syncToNolotus':
        await syncData(userId, key, content);
        console.log('Data synced successfully');
        break;
      case 'syncFromNolotus':
        await syncDataFromNolotus(key, content);
        console.log('Data synced from nolotus successfully');
        refreshData();
        break;
      default:
        console.error('Invalid operation');
    }
  } catch (error) {
    console.error(`Failed to ${operation} data:`, error);
  }
};
