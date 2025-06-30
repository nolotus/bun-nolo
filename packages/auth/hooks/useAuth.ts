import { useAppSelector } from "app/store";
import { selectCurrentUser, selectIsLoggedIn } from "../authSlice";

export const useAuth = () => {
  const user = useAppSelector(selectCurrentUser);
  const isLoggedIn = useAppSelector(selectIsLoggedIn);

  return { user, isLoggedIn };
};
