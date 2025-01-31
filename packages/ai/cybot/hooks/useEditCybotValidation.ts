// ai/cybot/hooks/useEditCybotValidation

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAppDispatch } from "app/hooks";
import { DataType } from "create/types";
import { patchData, write } from "database/dbSlice"; // 添加 write
import { useAuth } from "auth/hooks/useAuth";
import { createCybotKey } from "database/keys";
import { createCybotSchema, FormData } from "../createCybotSchema";

const extractCybotId = (path: string) => {
  const matches = path.match(/cybot-[^-]+-(\w+)/);
  return matches ? matches[1] : path;
};

export const useEditCybotValidation = (
  initialValues: FormData & { id: string }
) => {
  const dispatch = useAppDispatch();
  const auth = useAuth();

  const form = useForm<FormData>({
    resolver: zodResolver(createCybotSchema),
    defaultValues: {
      name: initialValues.name || "",
      tools: initialValues.tools || [],
      isPublic: initialValues.isPublic ?? false,
      provider: initialValues.provider || "",
      customProviderUrl: initialValues.customProviderUrl || "",
      model: initialValues.model || "",
      useServerProxy: initialValues.useServerProxy ?? true,
      greeting: initialValues.greeting || "",
      introduction: initialValues.introduction || "",
      inputPrice: initialValues.inputPrice ?? 0,
      outputPrice: initialValues.outputPrice ?? 0,
    },
  });

  const { watch } = form;
  const provider = watch("provider");
  const useServerProxy = watch("useServerProxy");
  const isPublic = watch("isPublic");

  const onSubmit = async (data: FormData) => {
    if (!auth.user?.userId) return;

    const now = Date.now();
    const cybotId = extractCybotId(initialValues.id);
    const userCybotPath = createCybotKey.private(auth.user.userId, cybotId);
    const publicCybotPath = createCybotKey.public(cybotId);

    const updateData = {
      ...data,
      updatedAt: now,
    };

    try {
      // 1. 更新私有版本
      await dispatch(
        patchData({
          id: userCybotPath,
          changes: {
            ...updateData,
            isPublic: data.isPublic,
          },
        })
      ).unwrap();

      // 2. 处理公开版本
      if (data.isPublic) {
        // 如果变更为公开,使用 write 而不是 patch
        await dispatch(
          write({
            data: {
              ...updateData,
              id: cybotId,
              type: DataType.CYBOT,
              userId: auth.user.userId,
              isPublic: true,
              createdAt: initialValues.createdAt || now,
              dialogCount: initialValues.dialogCount || 0,
              messageCount: initialValues.messageCount || 0,
              tokenCount: initialValues.tokenCount || 0,
              tags: initialValues.tags || [],
            },
            customId: publicCybotPath,
          })
        ).unwrap();
      }
      // 注: 如果从公开改为私有,不需要特殊处理,因为访问时会优先查看私有版本
    } catch (error) {
      throw error;
    }
  };

  return {
    form,
    provider,
    useServerProxy,
    isPublic,
    onSubmit,
  };
};
