import { api } from 'app/api';
import { API_VERSION } from 'database/config';
export interface User {
  first_name: string;
  last_name: string;
}

export interface UserResponse {
  user: User;
  token: string;
}

export interface LoginRequest {
  userId: string;
  token: string;
}
export interface RegisterRequest {
  username: string;
  password: string;
  email: string;
  // 你可以根据需要添加更多字段
}
export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<UserResponse, LoginRequest>({
      query: (credentials) => ({
        url: `${API_VERSION}/users/login`,
        method: 'POST',
        body: credentials,
      }),
    }),
    register: builder.mutation<UserResponse, RegisterRequest>({
      query: (user) => ({
        url: `${API_VERSION}/users/register`,
        method: 'POST',
        body: user,
      }),
    }),
  }),
  
});
export const { useLoginMutation,useRegisterMutation } = authApi;
