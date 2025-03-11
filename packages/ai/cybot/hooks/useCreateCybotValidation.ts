// ai/cybot/hooks/useCreateCybotValidation
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAppDispatch } from "app/hooks";
import { DataType } from "create/types";
import { write } from "database/dbSlice";
import { useAuth } from "auth/hooks/useAuth";
import { useCreateDialog } from "chat/dialog/useCreateDialog";
import { createCybotKey } from "database/keys";
import { ulid } from "ulid";
import { createCybotSchema, FormData } from "../createCybotSchema";

export const useCreateCybotValidation = () => {
  const dispatch = useAppDispatch();
  const { createNewDialog } = useCreateDialog();
  const auth = useAuth();

  const form = useForm<FormData>({
    resolver: zodResolver(createCybotSchema),
    defaultValues: {
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
      references: [], // 添加 references 默认值，类型由 FormData 定义
    },
  });

  const { watch } = form;
  const provider = watch("provider");
  const useServerProxy = watch("useServerProxy");
  const isPublic = watch("isPublic");

  const onSubmit = async (data: FormData) => {
    if (!auth.user?.userId) return;

    const now = Date.now();
    const id = ulid();
    const userCybotPath = createCybotKey.private(auth.user.userId, id);
    const publicCybotPath = createCybotKey.public(id);

    // 构建基础数据
    const cybotData = {
      ...data,
      id,
      type: DataType.CYBOT,
      userId: auth.user.userId,
      createdAt: now,
      updatedAt: now,
      dialogCount: 0,
      messageCount: 0,
      tokenCount: 0,
      tags: data.tags ? data.tags.split(",").map((tag) => tag.trim()) : [],
      references: data.references || [], // 确保 references 被包含
    };

    // 保存私有版本
    await dispatch(
      write({
        data: {
          ...cybotData,
          isPublic: data.isPublic,
        },
        customKey: userCybotPath,
      })
    ).unwrap();

    // 如果是公开的，保存公开版本
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

    // 创建对话时使用公开路径，这样其他用户也可以访问
    await createNewDialog({
      cybots: [data.isPublic ? publicCybotPath : userCybotPath],
    });
  };

  return {
    form,
    provider,
    useServerProxy,
    isPublic,
    onSubmit,
  };
};
