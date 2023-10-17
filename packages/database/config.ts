export const API_VERSION = '/api/v1';

export const API_ENDPOINTS = {
    DATABASE: `${API_VERSION}/db`,
    USERS: `${API_VERSION}/users`,
    UPDATE_PASSWORD: `${API_VERSION}/users/:id/password`,
    READ_ALL: `${API_VERSION}/db/readAll`,
  };