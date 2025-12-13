// 路径: app/features/ai/agent/hooks/useAgentValidation.ts

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback } from "react";
import { useAppDispatch } from "app/store";
import { DataType } from "create/types";
import { patch, write, remove } from "database/dbSlice";
import { useAuth } from "auth/hooks/useAuth";
import { useCreateDialog } from "chat/dialog/useCreateDialog";
import { createCybotKey } from "database/keys";
import { ulid } from "ulid";
import { useTranslation } from "react-i18next";
import {
  getCreateAgentSchema,
  FormData,
  normalizeReferences,
} from "../createAgentSchema";

// extractCybotId 函数保持不变
const extractCybotId = (path: string): string =>
  path.match(/cybot-[^-]+-(\w+)/)?.[1] || path;

// ExtendedFormData 接口保持不变（会自动包含新增字段）
interface ExtendedFormData extends FormData {
  id?: string;
  createdAt?: number;
  dialogCount?: number;
  messageCount?: number;
  tokenCount?: number;
}

export const useAgentValidation = (initialValues?: ExtendedFormData) => {
  const dispatch = useAppDispatch();
  const { createNewDialog } = useCreateDialog();
  const auth = useAuth();
  const { t } = useTranslation("ai");
  const isEditing = !!initialValues?.id;

  const form = useForm<FormData>({
    resolver: zodResolver(getCreateAgentSchema(t)),
    defaultValues: isEditing
      ? {
          ...initialValues,
          // 如果老数据里没有 apiSource，则默认 platform
          apiSource: initialValues.apiSource ?? "platform",
          tags: Array.isArray(initialValues.tags)
            ? initialValues.tags.join(", ")
            : initialValues.tags || "",
          references: normalizeReferences(initialValues.references || []),
          whitelist: initialValues.whitelist || [],
          // 自定义模型名：编辑模式下加载已有值，无则空字符串
          customModelName: initialValues.customModelName ?? "",
        }
      : {
          greeting: t("form.defaults.greeting"),
          useServerProxy: true,
          isPublic: false,
          whitelist: [],
          // 新建时默认为平台 API
          apiSource: "platform",
          // 新建时自定义模型名默认为空
          customModelName: "",
        },
  });

  const { watch } = form;

  // B 方案：在提交前统一清洗数据
  // useAgentValidation.ts 中的 processData

  const processData = useCallback((data: FormData) => {
    const isPublic = !!data.isPublic;

    // ✅ 不再依赖 provider，只看 apiSource
    const isCustomApi = data.apiSource === "custom";

    const result: any = {
      ...data,
      tags: data.tags
        ? data.tags
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : [],
      references: normalizeReferences(data.references || []),
      whitelist: isPublic ? data.whitelist || [] : [],
    };

    if (isCustomApi) {
      result.customModelName = data.customModelName?.trim() || "";
    } else {
      delete result.customModelName;
    }

    return result;
  }, []);

  const writeData = useCallback(
    async (data: any, path: string) => {
      await dispatch(write({ data, customKey: path })).unwrap();
    },
    [dispatch]
  );

  const onSubmit = useCallback(
    async (data: FormData) => {
      if (!auth.user?.userId) throw new Error(t("errors.noUserId"));

      const processedData = processData(data);
      const now = Date.now();

      if (isEditing) {
        const cybotId = extractCybotId(initialValues?.id || "");
        const userPath = createCybotKey.private(auth.user.userId, cybotId);
        const publicPath = createCybotKey.public(cybotId);

        // 1. 更新私有副本
        await dispatch(
          patch({ dbKey: userPath, changes: processedData })
        ).unwrap();

        if (processedData.isPublic) {
          // 2a. 公开：创建或更新公共副本
          await writeData(
            {
              ...initialValues,
              ...processedData,
              id: cybotId,
              type: DataType.CYBOT,
              userId: auth.user.userId,
            },
            publicPath
          );
        } else if (initialValues?.isPublic) {
          // 2b. 从公开变为私有：删除公共副本
          await dispatch(remove({ dbKey: publicPath })).unwrap();
        }
      } else {
        // 创建新 Agent
        const id = ulid();
        const userPath = createCybotKey.private(auth.user.userId, id);
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

        // 私有副本
        await writeData(cybotData, userPath);

        // 公共副本
        if (processedData.isPublic) {
          await writeData(cybotData, createCybotKey.public(id));
        }

        // 创建新对话
        await createNewDialog({
          agents: [
            processedData.isPublic ? createCybotKey.public(id) : userPath,
          ],
        });
      }
    },
    [
      auth.user,
      processData,
      isEditing,
      initialValues,
      dispatch,
      writeData,
      createNewDialog,
      t,
    ]
  );

  return {
    form,
    provider: watch("provider"),
    useServerProxy: watch("useServerProxy"),
    isPublic: watch("isPublic"),
    onSubmit,
    isEditing,
  };
};
