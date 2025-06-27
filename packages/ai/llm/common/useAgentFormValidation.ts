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
import {
  createAgentSchema,
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
  const isEditing = !!initialValues?.id;

  const form = useForm<FormData>({
    resolver: zodResolver(createAgentSchema),
    defaultValues: isEditing
      ? {
          ...initialValues,
          tags: Array.isArray(initialValues.tags)
            ? initialValues.tags.join(", ")
            : initialValues.tags || "",
          references: normalizeReferences(initialValues.references || []),
        }
      : undefined,
  });

  const { watch } = form;

  const processData = useCallback(
    (data: FormData) => ({
      ...data,
      prompt: data.prompt || "",
      greeting: data.greeting || "",
      introduction: data.introduction || "",
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
      if (!auth.user?.userId) throw new Error("No user ID available");

      const processedData = processData(data);
      const now = Date.now();

      if (isEditing) {
        const cybotId = extractCybotId(initialValues?.id || "");
        const userPath = createCybotKey.private(auth.user.userId, cybotId);

        await dispatch(
          patch({
            dbKey: userPath,
            changes: { ...processedData, isPublic: data.isPublic },
          })
        ).unwrap();

        if (data.isPublic) {
          await writeData(
            {
              ...processedData,
              id: cybotId,
              type: DataType.CYBOT,
              userId: auth.user.userId,
              isPublic: true,
              createdAt: initialValues?.createdAt || now,
              dialogCount: initialValues?.dialogCount || 0,
              messageCount: initialValues?.messageCount || 0,
              tokenCount: initialValues?.tokenCount || 0,
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
          isPublic: data.isPublic,
        };

        await writeData(cybotData, userPath);

        if (data.isPublic) {
          await writeData(
            { ...cybotData, isPublic: true },
            createCybotKey.public(id)
          );
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
