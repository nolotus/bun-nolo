import React, { useState } from "react";
import { useAppDispatch, useAppSelector } from "app/hooks";
import { selectCurrentUserId } from "auth/authSlice";
import { write } from "database/dbSlice";
import { DataType } from "create/types";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";

export const useCreateDialog = () => {
  const navigate = useNavigate();

  const currentUserId = useAppSelector(selectCurrentUserId);
  const dispatch = useAppDispatch();

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const createDialog = async (llmId: string) => {
    setIsLoading(true);
    setIsSuccess(false);

    const messageListConfig = {
      data: [],
      flags: { isList: true },
      userId: currentUserId,
    };

    try {
      //todo could write in local first
      const writeMessageAction = await dispatch(write(messageListConfig));
      const initMessageList = writeMessageAction.payload;

      const dialogConfig = {
        data: {
          type: DataType.Dialog,
          llmId,
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
    } finally {
      setIsLoading(false);
    }
  };

  return { createDialog, isLoading, isSuccess };
};
