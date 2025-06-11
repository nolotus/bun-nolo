import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback } from "react";
import { useAppDispatch } from "app/hooks";
import { DataType } from "create/types";
import { patch, write } from "database/dbSlice";
import { useAuth } from "auth/hooks/useAuth";
import { useCreateDialog } from "chat/dialog/useCreateDialog";
import { createCybotKey } from "database/keys";
import { ulid } from "ulid";
import { createCybotSchema, FormData } from "./createCybotSchema";

const extractCybotId = (path: string): string => {
  const matches = path.match(/cybot-[^-]+-(\w+)/);
  if (!matches) {
    console.error(
      `[extractCybotId] Failed to extract cybot ID from path: ${path}`
    );
    return path;
  }
  return matches[1];
};

interface ExtendedFormData extends FormData {
  id?: string;
  createdAt?: number;
  dialogCount?: number;
  messageCount?: number;
  tokenCount?: number;
}

// 数据兼容性处理：转换旧的 references 格式
const normalizeReferences = (references: any[]): any[] => {
  if (!Array.isArray(references)) return [];

  return references.map((ref) => ({
    ...ref,
    // 兼容性处理：将旧的 "page" 类型转换为 "knowledge"
    type: ref.type === "page" ? "knowledge" : ref.type || "knowledge",
  }));
};

// 提取默认值创建函数
const createDefaultValues = (
  initialValues?: ExtendedFormData,
  isEditing: boolean
) => {
  const baseDefaults = {
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
    reasoning_effort: undefined,
  };

  if (!isEditing || !initialValues) {
    return baseDefaults;
  }

  // 处理 references 的兼容性问题
  const processedReferences = normalizeReferences(
    initialValues.references || []
  );

  return {
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
    references: processedReferences, // 使用处理后的 references
    smartReadEnabled: initialValues.smartReadEnabled ?? false,
    temperature: initialValues.temperature,
    top_p: initialValues.top_p,
    frequency_penalty: initialValues.frequency_penalty,
    presence_penalty: initialValues.presence_penalty,
    max_tokens: initialValues.max_tokens,
    reasoning_effort: initialValues.reasoning_effort,
  };
};

export const useCybotValidation = (initialValues?: ExtendedFormData) => {
  const dispatch = useAppDispatch();
  const { createNewDialog } = useCreateDialog();
  const auth = useAuth();

  const isEditing = !!initialValues?.id;

  console.log("[useCybotValidation] Initial values:", initialValues);

  const form = useForm<FormData>({
    resolver: zodResolver(createCybotSchema),
    defaultValues: createDefaultValues(initialValues, isEditing),
  });

  const { watch } = form;
  const provider = watch("provider");
  const useServerProxy = watch("useServerProxy");
  const isPublic = watch("isPublic");

  // 改进类型安全性和性能，同时处理数据兼容性
  const processData = useCallback(
    (
      data: FormData
    ): Omit<
      ExtendedFormData,
      "id" | "createdAt" | "dialogCount" | "messageCount" | "tokenCount"
    > => {
      try {
        // 处理 references 的兼容性
        const processedReferences = normalizeReferences(data.references || []);

        const result = {
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
          references: processedReferences, // 使用处理后的 references
          smartReadEnabled: data.smartReadEnabled || false,
          temperature: data.temperature,
          top_p: data.top_p,
          frequency_penalty: data.frequency_penalty,
          presence_penalty: data.presence_penalty,
          max_tokens: data.max_tokens,
        };

        if (data.reasoning_effort !== undefined) {
          result.reasoning_effort = data.reasoning_effort;
        }

        return result;
      } catch (error) {
        console.error("[processData] Error processing form data:", error);
        throw new Error(
          `Failed to process form data: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    },
    []
  );

  const handleEditSubmission = useCallback(
    async (data: FormData, processedData: ReturnType<typeof processData>) => {
      console.log("[handleEditSubmission] Input data:", data);
      console.log("[handleEditSubmission] Processed data:", processedData);

      const cybotId = extractCybotId(initialValues?.id || "");
      if (!cybotId) {
        throw new Error("Invalid cybot ID in initial values");
      }

      const userCybotPath = createCybotKey.private(auth.user!.userId, cybotId);
      const publicCybotPath = createCybotKey.public(cybotId);

      const updatePayload = { ...processedData, isPublic: data.isPublic };
      console.log("[handleEditSubmission] Updating path:", userCybotPath);
      console.log("[handleEditSubmission] Update payload:", updatePayload);

      await dispatch(
        patch({
          dbKey: userCybotPath,
          changes: updatePayload,
        })
      ).unwrap();

      if (data.isPublic) {
        console.log(
          "[handleEditSubmission] Writing public cybot data:",
          publicCybotPath
        );
        await dispatch(
          write({
            data: {
              ...processedData,
              id: cybotId,
              type: DataType.CYBOT,
              userId: auth.user!.userId,
              isPublic: true,
              createdAt: initialValues?.createdAt || Date.now(),
              dialogCount: initialValues?.dialogCount || 0,
              messageCount: initialValues?.messageCount || 0,
              tokenCount: initialValues?.tokenCount || 0,
            },
            customKey: publicCybotPath,
          })
        ).unwrap();
      }

      console.log(
        "[handleEditSubmission] Edit submission completed successfully"
      );
    },
    [dispatch, auth.user, initialValues]
  );

  const handleCreateSubmission = useCallback(
    async (data: FormData, processedData: ReturnType<typeof processData>) => {
      const id = ulid();
      const now = Date.now();
      const userCybotPath = createCybotKey.private(auth.user!.userId, id);
      const publicCybotPath = createCybotKey.public(id);

      const cybotData = {
        ...processedData,
        id,
        type: DataType.CYBOT,
        userId: auth.user!.userId,
        createdAt: now,
        updatedAt: now,
        dialogCount: 0,
        messageCount: 0,
        tokenCount: 0,
      };

      console.log(
        "[handleCreateSubmission] Writing new user cybot data:",
        userCybotPath
      );
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
        console.log(
          "[handleCreateSubmission] Writing new public cybot data:",
          publicCybotPath
        );
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

      console.log("[handleCreateSubmission] Creating new dialog");
      await createNewDialog({
        cybots: [data.isPublic ? publicCybotPath : userCybotPath],
      });
    },
    [dispatch, auth.user, createNewDialog]
  );

  const onSubmit = useCallback(
    async (data: FormData) => {
      try {
        if (!auth.user?.userId) {
          throw new Error("No user ID available, aborting submission");
        }

        console.log("[useCybotValidation] Submitting form data:", data);

        const processedData = processData(data);

        if (isEditing) {
          await handleEditSubmission(data, processedData);
        } else {
          await handleCreateSubmission(data, processedData);
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        console.error("[useCybotValidation] Submission failed:", errorMessage);
        throw new Error(`Submission failed: ${errorMessage}`);
      }
    },
    [
      auth.user,
      processData,
      isEditing,
      handleEditSubmission,
      handleCreateSubmission,
    ]
  );

  return {
    form,
    provider,
    useServerProxy,
    isPublic,
    onSubmit,
    isEditing,
  };
};
