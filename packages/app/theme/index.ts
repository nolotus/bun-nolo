import { useAppSelector } from "../hooks";
import { selectTheme } from "app/settings/settingSlice";

export const useTheme = () => {
  const theme = useAppSelector(selectTheme);
  return theme;
};
