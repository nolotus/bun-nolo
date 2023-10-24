export interface State {
  currentUser: User | null;
  users: User[];
  isLoggedIn: boolean;
}

export const initialState: State = {
  currentUser: null,
  users: [],
  isLoggedIn:false
};
export interface User {
  userId: number;
  username: string;
  email?: string;
}
export type UserAction = 
 | { type: 'CHANGE_CURRENT_USER'; payload: {user:User} }
 | { type: 'SET_USERS'; payload: User[] }
 | { type: 'USER_LOGIN'; payload: { user: User } }
 | { type: 'LOGOUT_CURRENT_USER' }
 | { type: 'USER_REGISTER'; payload: {user:User} }
 | { type: 'RESTORE_SESSION'; payload: { user: User, users: User[] }};

// reducer 函数
export function userReducer(state: State, action:UserAction) {
  switch (action.type) {
    case "CHANGE_CURRENT_USER":
      return {
        ...state,
        currentUser: action.payload.user,
      };
    case "SET_USERS":
      return {
        ...state,
        users: action.payload,
      };
    case "USER_LOGIN":
      return {
        ...state,
        isLoggedIn: true,
        currentUser: action.payload.user,
        users: [action.payload.user, ...state.users],
      };

    case "LOGOUT_CURRENT_USER":
      const updatedUsers = state.users.filter(
        (user) => user !== state.currentUser
      );
      const nextUser = updatedUsers.length > 0 ? updatedUsers[0] : null;
      return {
        ...state,
        isLoggedIn: nextUser ? true : false,
        currentUser: nextUser,
        users: updatedUsers,
      };
    case "USER_REGISTER":
      return {
        ...state,
        currentUser: action.payload.user,
        isLoggedIn: true,
        users: [action.payload.user, ...state.users],
      };
    case "RESTORE_SESSION":
      return {
        ...state,
        isLoggedIn: true,
        currentUser: action.payload.user,
      };


      
  }
}
