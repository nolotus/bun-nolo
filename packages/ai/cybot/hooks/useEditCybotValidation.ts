import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAppDispatch } from "app/hooks";
import { DataType } from "create/types";
import { patch, write } from "database/dbSlice";
import { useAuth } from "auth/hooks/useAuth";
import { createCybotKey } from "database/keys";
import {
  createCybotSchema,
  FormData,
  DEFAULT_TEMPERATURE,
  DEFAULT_TOP_P,
  DEFAULT_FREQUENCY_PENALTY,
  DEFAULT_PRESENCE_PENALTY,
  DEFAULT_MAX_TOKENS,
} from "../createCybotSchema";

const extractCybotId = (path: string) => {
  const matches = path.match(/cybot-[^-]+-(\w+)/);
  return matches ? matches[1] : path;
};

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
      references: initialValues.references || [],
      smartReadEnabled: initialValues.smartReadEnabled ?? false,
      temperature: initialValues.temperature ?? DEFAULT_TEMPERATURE,
      top_p: initialValues.top_p ?? DEFAULT_TOP_P,
      frequency_penalty:
        initialValues.frequency_penalty ?? DEFAULT_FREQUENCY_PENALTY,
      presence_penalty:
        initialValues.presence_penalty ?? DEFAULT_PRESENCE_PENALTY,
      max_tokens: initialValues.max_tokens ?? DEFAULT_MAX_TOKENS,
    },
  });

  const { watch } = form;
  const provider = watch("provider");
  const useServerProxy = watch("useServerProxy");
  const isPublic = watch("isPublic");

  // 提取数据处理逻辑
  const processData = (data: FormData) => ({
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
    smartReadEnabled: data.smartReadEnabled || false,
    temperature: data.temperature ?? DEFAULT_TEMPERATURE,
    top_p: data.top_p ?? DEFAULT_TOP_P,
    frequency_penalty: data.frequency_penalty ?? DEFAULT_FREQUENCY_PENALTY,
    presence_penalty: data.presence_penalty ?? DEFAULT_PRESENCE_PENALTY,
    max_tokens: data.max_tokens ?? DEFAULT_MAX_TOKENS,
  });

  const onSubmit = async (data: FormData) => {
    if (!auth.user?.userId) {
      console.error("[useEditCybotValidation] No userId, aborting submission");
      return;
    }

    const now = Date.now();
    const cybotId = extractCybotId(initialValues.id);
    const userCybotPath = createCybotKey.private(auth.user.userId, cybotId);
    const publicCybotPath = createCybotKey.public(cybotId);
    const processedData = processData(data);

    try {
      await dispatch(
        patch({
          dbKey: userCybotPath,
          changes: { ...processedData, isPublic: data.isPublic },
        })
      ).unwrap();
      if (data.isPublic) {
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
    } catch (error) {
      console.error(
        "[useEditCybotValidation] Submission failed with error:",
        error
      );
      throw error;
    }
  };

  return { form, provider, useServerProxy, isPublic, onSubmit };
};
