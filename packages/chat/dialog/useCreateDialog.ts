// chat/dialog/useCreateDialog.ts
import React, { useState } from "react";
import { useAppDispatch, useAppSelector } from "app/hooks";
import { selectCurrentUserId } from "auth/authSlice";
import { write } from "database/dbSlice";
import { DataType } from "create/types";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";

export interface CreateDialogParams {
  cybots: string[];
  category?: string;
  users?: string[];
}

interface UseCreateDialogResult {
  createDialog: (params: CreateDialogParams) => Promise<void>;
  isLoading: boolean;
  isSuccess: boolean;
}

interface DialogData {
  type: DataType.Dialog;
  cybots: string[];
  messageListId: string;
  title: string;
  category: string;
}

interface DialogConfig {
  data: DialogData;
  flags: {
    isJSON: boolean;
  };
  userId: string;
}

export const useCreateDialog = (): UseCreateDialogResult => {
  const navigate = useNavigate();

  const currentUserId = useAppSelector(selectCurrentUserId);
  const dispatch = useAppDispatch();

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const createDialog = async ({
    cybots,
    users,
    category,
  }: CreateDialogParams) => {
    setIsLoading(true);
    setIsSuccess(false);
    if (cybots) {
      const messageListConfig = {
        data: [],
        flags: { isList: true },
        userId: currentUserId,
      };

      try {
        const writeMessageAction = await dispatch(write(messageListConfig));
        const initMessageList = writeMessageAction.payload;

        const dialogConfig: DialogConfig = {
          data: {
            type: DataType.Dialog,
            cybots,
            category,
            messageListId: initMessageList.id,
            title: format(new Date(), "MM-dd HH:mm"),
          },
          flags: { isJSON: true },
          userId: currentUserId,
        };

        const result = await dispatch(write(dialogConfig));
        navigate(`/chat?dialogId=${result.payload.id}`);
        setIsSuccess(true);
      } catch (error) {
        // 错误处理
      } finally {
        setIsLoading(false);
      }
    }
  };

  return { createDialog, isLoading, isSuccess };
};
