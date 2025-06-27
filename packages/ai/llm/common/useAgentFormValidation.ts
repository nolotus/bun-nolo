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
import { useTranslation } from "react-i18next";
import {
  getCreateAgentSchema,
  FormData,
  normalizeReferences,
} from "./createAgentSchema";

const extractCybotId = (path: string): string =>
  path.match(/cybot-[^-]+-(\w+)/)?.[1] || path;

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
  const { t } = useTranslation("ai"); // 1. 获取翻译函数
  const isEditing = !!initialValues?.id;

  const form = useForm<FormData>({
    // 2. 动态生成带翻译的 schema
    resolver: zodResolver(getCreateAgentSchema(t)),
    defaultValues: isEditing
      ? {
          ...initialValues,
          tags: Array.isArray(initialValues.tags)
            ? initialValues.tags.join(", ")
            : initialValues.tags || "",
          references: normalizeReferences(initialValues.references || []),
        }
      : {
          // 3. 为创建模式设置默认问候语
          greeting: t("form.defaults.greeting"),
          useServerProxy: true,
          isPublic: false,
        },
  });

  const { watch } = form;

  const processData = useCallback(
    (data: FormData) => ({
      ...data,
      tags: data.tags
        ? data.tags
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : [],
      references: normalizeReferences(data.references || []),
    }),
    []
  );

  const writeData = useCallback(
    async (data: any, path: string) => {
      await dispatch(write({ data, customKey: path })).unwrap();
    },
    [dispatch]
  );

  const onSubmit = useCallback(
    async (data: FormData) => {
      // 4. 翻译错误信息
      if (!auth.user?.userId) throw new Error(t("errors.noUserId"));

      const processedData = processData(data);
      const now = Date.now();

      if (isEditing) {
        const cybotId = extractCybotId(initialValues?.id || "");
        const userPath = createCybotKey.private(auth.user.userId, cybotId);

        await dispatch(
          patch({ dbKey: userPath, changes: processedData })
        ).unwrap();

        if (data.isPublic) {
          await writeData(
            {
              ...initialValues,
              ...processedData,
              id: cybotId,
              type: DataType.CYBOT,
              userId: auth.user.userId,
            },
            createCybotKey.public(cybotId)
          );
        }
      } else {
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

        await writeData(cybotData, userPath);

        if (data.isPublic) {
          await writeData(cybotData, createCybotKey.public(id));
        }

        await createNewDialog({
          agents: [data.isPublic ? createCybotKey.public(id) : userPath],
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
