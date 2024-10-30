import { api } from "app/api";
import { API_VERSION } from "database/config";
//maybe need delete
export interface User {
  first_name: string;
  last_name: string;
}

export interface DeleteUserRequest {
  userId: string;
}
export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    deleteUser: builder.mutation<void, DeleteUserRequest>({
      query: (data) => ({
        url: `${API_VERSION}/users/delete/${data.userId}`,
        method: "DELETE",
      }),
    }),
  }),
});
export const { useDeleteUserMutation } = authApi;
