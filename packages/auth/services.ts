import { api } from "app/api";
import { API_VERSION } from "database/config";

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

export interface DeleteUserRequest {
  userId: string;
}
export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<UserResponse, LoginRequest>({
      query: (credentials) => ({
        url: `${API_VERSION}/users/login`,
        method: "POST",
        body: credentials,
      }),
    }),
    signup: builder.mutation<UserResponse, RegisterRequest>({
      query: (user) => ({
        url: `${API_VERSION}/users/signup`,
        method: "POST",
        body: user,
      }),
    }),
    deleteUser: builder.mutation<void, DeleteUserRequest>({
      query: (data) => ({
        url: `${API_VERSION}/users/delete/${data.userId}`,
        method: "DELETE",
      }),
    }),
  }),
});
export const { useLoginMutation, useSignupMutation, useDeleteUserMutation } =
  authApi;
