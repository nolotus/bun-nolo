// chat/dialog/useCreateDialog.ts
import React, { useState } from "react";
import { useAppDispatch } from "app/hooks";
import { useNavigate } from "react-router-dom";

import { createDialog } from "./dialogSlice";

export interface CreateDialogParams {
  cybots: string[];
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
    cybots,
    users,
    category,
  }: CreateDialogParams) => {
    setIsLoading(true);
    setIsSuccess(false);
    if (cybots) {
      try {
        const result = await dispatch(createDialog({ cybots })).unwrap();
        console.log("result", result);
        navigate(`/${result.id}`);
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
