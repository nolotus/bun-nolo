import type { AppDispatch } from "app/store";
import { useDispatch } from "react-redux";

export const useAppDispatch: () => AppDispatch = useDispatch;
