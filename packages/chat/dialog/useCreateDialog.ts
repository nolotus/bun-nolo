// chat/dialog/useCreateDialog.ts

import { useAppDispatch } from "app/hooks";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createDialog } from "./dialogSlice";

export interface CreateDialogParams {
  agents: string[];
  category?: string;
  users?: string[];
}

interface UseCreateDialogResult {
  createNewDialog: (params: CreateDialogParams) => Promise<void>;
  isLoading: boolean;
  isSuccess: boolean;
}

export const useCreateDialog = (): UseCreateDialogResult => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const createNewDialog = async ({
    agents,
    users,
    category,
  }: CreateDialogParams) => {
    setIsLoading(true);
    setIsSuccess(false);
    if (agents) {
      try {
        const result = await dispatch(
          createDialog({ cybots: agents })
        ).unwrap();
        navigate(`/${result.dbKey}`);
        setIsSuccess(true);
      } catch (error) {
        // 错误处理
      } finally {
        setIsLoading(false);
      }
    }
  };

  return { createNewDialog, isLoading, isSuccess };
};
