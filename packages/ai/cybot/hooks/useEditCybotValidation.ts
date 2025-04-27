// ai/cybot/hooks/useEditCybotValidation

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAppDispatch } from "app/hooks";
import { DataType } from "create/types";
import { patch, write } from "database/dbSlice";
import { useAuth } from "auth/hooks/useAuth";
import { createCybotKey } from "database/keys";
import { createCybotSchema, FormData } from "../createCybotSchema";

const extractCybotId = (path: string) => {
  const matches = path.match(/cybot-[^-]+-(\w+)/);
  return matches ? matches[1] : path;
};

// 更新 ExtendedFormData 接口以匹配 createCybotSchema 中的 references 类型
interface ExtendedFormData extends FormData {
  id: string;
  createdAt?: number;
  dialogCount?: number;
  messageCount?: number;
  tokenCount?: number;
}

export const useEditCybotValidation = (initialValues: ExtendedFormData) => {
  const dispatch = useAppDispatch();
  const auth = useAuth();

  const form = useForm<FormData>({
    resolver: zodResolver(createCybotSchema),
    defaultValues: {
      name: initialValues.name || "",
      provider: initialValues.provider || "",
      model: initialValues.model || "",
      customProviderUrl: initialValues.customProviderUrl || "",
      apiKey: initialValues.apiKey || "",
      useServerProxy: initialValues.useServerProxy ?? true,
      prompt: initialValues.prompt || "",
      tools: initialValues.tools || [],
      isPublic: initialValues.isPublic ?? false,
      greeting: initialValues.greeting || "",
      introduction: initialValues.introduction || "",
      inputPrice: initialValues.inputPrice ?? 0,
      outputPrice: initialValues.outputPrice ?? 0,
      tags: Array.isArray(initialValues.tags)
        ? initialValues.tags.join(", ")
        : initialValues.tags || "",
      references: initialValues.references || [], // 类型由 FormData 定义
    },
  });

  const { watch } = form;

  const provider = watch("provider");
  const useServerProxy = watch("useServerProxy");
  const isPublic = watch("isPublic");

  const onSubmit = async (data: FormData) => {
    console.log("[useEditCybotValidation] onSubmit triggered with data:", data);
    if (!auth.user?.userId) {
      console.log("[useEditCybotValidation] No userId, aborting submission");
      return;
    }

    const now = Date.now();
    const cybotId = extractCybotId(initialValues.id);
    const userCybotPath = createCybotKey.private(auth.user.userId, cybotId);
    const publicCybotPath = createCybotKey.public(cybotId);

    // 确保文本字段保留换行符
    const processedData = {
      ...data,
      prompt: data.prompt || "",
      greeting: data.greeting || "",
      introduction: data.introduction || "",
      tags: data.tags
        ? data.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean)
        : [],
      references: data.references || [],
    };

    try {
      console.log(
        "[useEditCybotValidation] Updating private version at:",
        userCybotPath
      );
      await dispatch(
        patch({
          dbKey: userCybotPath,
          changes: {
            ...processedData,
            isPublic: data.isPublic,
          },
        })
      ).unwrap();

      if (data.isPublic) {
        console.log(
          "[useEditCybotValidation] Writing public version at:",
          publicCybotPath
        );
        await dispatch(
          write({
            data: {
              ...processedData,
              id: cybotId,
              type: DataType.CYBOT,
              userId: auth.user.userId,
              isPublic: true,
              createdAt: initialValues.createdAt || now,
              dialogCount: initialValues.dialogCount || 0,
              messageCount: initialValues.messageCount || 0,
              tokenCount: initialValues.tokenCount || 0,
            },
            customKey: publicCybotPath,
          })
        ).unwrap();
      }
      console.log("[useEditCybotValidation] Submission completed successfully");
    } catch (error) {
      console.error(
        "[useEditCybotValidation] Submission failed with error:",
        error
      );
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
