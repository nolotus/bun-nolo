import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAppDispatch } from "app/hooks";
import { DataType } from "create/types";
import { patch, write } from "database/dbSlice";
import { useAuth } from "auth/hooks/useAuth";
import { useCreateDialog } from "chat/dialog/useCreateDialog";
import { createCybotKey } from "database/keys";
import { ulid } from "ulid";
import { createCybotSchema, FormData } from "./createCybotSchema";

const extractCybotId = (path: string) => {
  const matches = path.match(/cybot-[^-]+-(\w+)/);
  return matches ? matches[1] : path;
};

interface ExtendedFormData extends FormData {
  id?: string;
  createdAt?: number;
  dialogCount?: number;
  messageCount?: number;
  tokenCount?: number;
}

export const useCybotValidation = (initialValues?: ExtendedFormData) => {
  const dispatch = useAppDispatch();
  const { createNewDialog } = useCreateDialog();
  const auth = useAuth();

  const isEditing = !!initialValues?.id;

  const form = useForm<FormData>({
    resolver: zodResolver(createCybotSchema),
    defaultValues: isEditing
      ? {
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
          temperature: initialValues.temperature,
          top_p: initialValues.top_p,
          frequency_penalty: initialValues.frequency_penalty,
          presence_penalty: initialValues.presence_penalty,
          max_tokens: initialValues.max_tokens,
          reasoning_effort: initialValues.reasoning_effort, // 保持原样，不设置默认值
        }
      : {
          name: "",
          provider: "",
          model: "",
          customProviderUrl: "",
          apiKey: "",
          useServerProxy: true,
          prompt: "",
          tools: [],
          isPublic: false,
          greeting: "",
          introduction: "",
          inputPrice: 0,
          outputPrice: 0,
          tags: "",
          references: [],
          smartReadEnabled: false,
          temperature: undefined,
          top_p: undefined,
          frequency_penalty: undefined,
          presence_penalty: undefined,
          max_tokens: undefined,
          reasoning_effort: undefined, // 保持 undefined，不设置默认值
        },
  });

  const { watch } = form;
  const provider = watch("provider");
  const useServerProxy = watch("useServerProxy");
  const isPublic = watch("isPublic");

  const processData = (data: FormData) => {
    const result: any = {
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
      temperature: data.temperature,
      top_p: data.top_p,
      frequency_penalty: data.frequency_penalty,
      presence_penalty: data.presence_penalty,
      max_tokens: data.max_tokens,
    };

    // 只有当 reasoning_effort 有值时才添加到结果中
    if (data.reasoning_effort !== undefined) {
      result.reasoning_effort = data.reasoning_effort;
    }

    return result;
  };

  const onSubmit = async (data: FormData) => {
    if (!auth.user?.userId) {
      console.error("[useCybotValidation] No userId, aborting submission");
      return;
    }

    const now = Date.now();
    const processedData = processData(data);

    if (isEditing) {
      const cybotId = extractCybotId(initialValues.id || "");
      const userCybotPath = createCybotKey.private(auth.user.userId, cybotId);
      const publicCybotPath = createCybotKey.public(cybotId);

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
          "[useCybotValidation] Edit submission failed with error:",
          error
        );
        throw error;
      }
    } else {
      const id = ulid();
      const userCybotPath = createCybotKey.private(auth.user.userId, id);
      const publicCybotPath = createCybotKey.public(id);

      const cybotData = {
        ...processedData,
        id,
        type: DataType.CYBOT,
        userId: auth.user.userId,
        createdAt: now,
        updatedAt: now,
        dialogCount: 0,
        messageCount: 0,
        tokenCount: 0,
      };

      await dispatch(
        write({
          data: {
            ...cybotData,
            isPublic: data.isPublic,
          },
          customKey: userCybotPath,
        })
      ).unwrap();

      if (data.isPublic) {
        await dispatch(
          write({
            data: {
              ...cybotData,
              isPublic: true,
            },
            customKey: publicCybotPath,
          })
        ).unwrap();
      }

      await createNewDialog({
        cybots: [data.isPublic ? publicCybotPath : userCybotPath],
      });
    }
  };

  return {
    form,
    provider,
    useServerProxy,
    isPublic,
    onSubmit,
    isEditing,
  };
};
