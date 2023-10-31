import { handleError } from 'database/client/handleError';
import { writeData, writeHashData } from 'database/client/write';
import { getLogger } from 'utils/logger';

const formLogger = getLogger('form');

export const createArticle = (data, navigate, setError) => {
  formLogger.info('Submitting form with data:', data);

  if (data.path) {
    writeData({ ...data, type: 'article' }, { isJSON: true }, data.path)
      .then((responseData) => {
        formLogger.info('Successfully wrote data:', responseData);
        navigate(`/${responseData.dataId}`);
      })
      .catch((err) => {
        const message = handleError(err);
        formLogger.error('Failed to write data:', err);
        setError(message);
      });
  } else {
    writeHashData({ ...data, type: 'article' }, { isJSON: true })
      .then((responseData) => {
        formLogger.info('Successfully wrote hash data:', responseData);
        navigate(`/${responseData.dataId}`);
      })
      .catch((err) => {
        const message = handleError(err);
        formLogger.error('Failed to write hash data:', err);
        setError(message);
      });
  }
};
