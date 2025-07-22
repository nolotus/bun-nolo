// 路径: app/features/ai/common/useAgentValidation.ts (替换后的完整文件)

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback } from "react";
import { useAppDispatch } from "app/store";
import { DataType } from "create/types";
// [修改1] 导入 remove action，为未来的“下架”功能做准备（热修暂时不用）
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
} from "./createAgentSchema";

// extractCybotId 函数保持不变
const extractCybotId = (path: string): string =>
  path.match(/cybot-[^-]+-(\w+)/)?.[1] || path;

// ExtendedFormData 接口保持不变
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
    // [修改2] 更新 defaultValues 以包含 whitelist
    defaultValues: isEditing
      ? {
          ...initialValues,
          tags: Array.isArray(initialValues.tags)
            ? initialValues.tags.join(", ")
            : initialValues.tags || "",
          references: normalizeReferences(initialValues.references || []),
          // 如果是编辑模式，从 initialValues 加载 whitelist，否则为空数组
          whitelist: initialValues.whitelist || [],
        }
      : {
          greeting: t("form.defaults.greeting"),
          useServerProxy: true,
          isPublic: false,
          // 新建时，whitelist 默认为空数组
          whitelist: [],
        },
  });

  const { watch } = form;

  // [修改3] 增强 processData 函数以处理 whitelist
  const processData = useCallback((data: FormData) => {
    // 检查 data.isPublic 的值
    const isPublic = !!data.isPublic;

    return {
      ...data,
      tags: data.tags
        ? data.tags
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : [],
      references: normalizeReferences(data.references || []),
      // 核心逻辑：如果不公开，则强制白名单为空数组，保证数据干净
      whitelist: isPublic ? data.whitelist || [] : [],
    };
  }, []);

  const writeData = useCallback(
    async (data: any, path: string) => {
      await dispatch(write({ data, customKey: path })).unwrap();
    },
    [dispatch]
  );

  // [修改4] onSubmit 函数的微调，以处理从“公开”到“私有”的转换
  const onSubmit = useCallback(
    async (data: FormData) => {
      if (!auth.user?.userId) throw new Error(t("errors.noUserId"));

      // 经过 processData 处理后，processedData 已经是我们想要的最终数据形态
      const processedData = processData(data);
      const now = Date.now();

      if (isEditing) {
        const cybotId = extractCybotId(initialValues?.id || "");
        const userPath = createCybotKey.private(auth.user.userId, cybotId);
        const publicPath = createCybotKey.public(cybotId);

        // 1. 更新私有副本 (逻辑不变)
        await dispatch(
          patch({ dbKey: userPath, changes: processedData })
        ).unwrap();

        if (processedData.isPublic) {
          // 2a. 如果是公开，则创建或更新公共副本 (逻辑不变)
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
          // 2b. [新增逻辑] 如果是从“公开”变为“不公开”，则删除公共副本
          // 这是为了防止数据残留，是热修方案的一个重要健壮性提升。
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

        // 写入私有副本 (逻辑不变)
        await writeData(cybotData, userPath);

        // 写入公共副本 (逻辑不变)
        if (processedData.isPublic) {
          await writeData(cybotData, createCybotKey.public(id));
        }

        // 创建新对话 (逻辑不变)
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

  // 返回值保持不变
  return {
    form,
    provider: watch("provider"),
    useServerProxy: watch("useServerProxy"),
    isPublic: watch("isPublic"),
    onSubmit,
    isEditing,
  };
};
