import { t } from 'i18next';

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
