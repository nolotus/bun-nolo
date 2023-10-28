import { writeData, writeHashData } from 'database/client/write';
import { t } from 'i18next';
import { getLogger } from 'utils/logger';

const createLogger = getLogger('create');

export const handleError = (error, handleUnauthorized?) => {
  console.error(error);

  let message;
  switch (error.message) {
    case '400':
      message = t('errors.validationError');
      break;
    case '401':
      message = t('errors.unauthorized');
      handleUnauthorized && handleUnauthorized();
      break;
    case '500':
    default:
      message = t('errors.serverError');
      break;
  }

  return message;
};

export const createChatRobot = (data, setIsSuccess, setError, userId) => {
  createLogger.info('Submitting form with data:', data);

  if (data.path) {
    writeData(
      { ...data, type: 'chatRobot' },
      { isJSON: true },
      data.path,
      userId,
    )
      .then((responseData) => {
        createLogger.info('Successfully updated hash data:', responseData);
        setIsSuccess(responseData.dataId); // 设置成功状态和新创建的聊天机器人的 ID
      })
      .catch((err) => {
        const message = handleError(err);
        createLogger.error('Failed to update hash data:', err);
        setError(message);
      });
  } else {
    // Create new chat robot
    writeHashData({ ...data, type: 'chatRobot' }, { isJSON: true }, userId)
      .then((responseData) => {
        createLogger.info('Successfully wrote hash data:', responseData);
        setIsSuccess(responseData.dataId); // 设置成功状态和新创建的聊天机器人的 ID
      })
      .catch((err) => {
        const message = handleError(err);
        createLogger.error('Failed to write hash data:', err);
        setError(message);
      });
  }
};
