import { useAppSelector } from "../hooks";
import { selectTheme } from "./themeSlice";

export const useTheme = () => {
  const theme = useAppSelector(selectTheme);
  return theme;
};
