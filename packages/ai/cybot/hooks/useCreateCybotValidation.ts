// hooks/useCreateCybotValidation.ts
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAppDispatch } from "app/hooks";
import { DataType } from "create/types";
import { write } from "database/dbSlice";
import { useAuth } from "auth/useAuth";
import { createCybotSchema, FormData } from "../createCybotSchema";
import { useCreateDialog } from "chat/dialog/useCreateDialog";
import { generateCybotKey } from "database/generateKey";

export const useCreateCybotValidation = () => {
  const dispatch = useAppDispatch();
  const { createNewDialog } = useCreateDialog();
  const auth = useAuth();

  const form = useForm<FormData>({
    resolver: zodResolver(createCybotSchema),
    defaultValues: {
      tools: [],
      isPrivate: false,
      isEncrypted: false,
      provider: "",
      customProviderUrl: "",
      model: "",
      useServerProxy: true,
    },
  });

  const { watch } = form;
  const provider = watch("provider");
  const isPrivate = watch("isPrivate");
  const isEncrypted = watch("isEncrypted");
  const useServerProxy = watch("useServerProxy");

  const onSubmit = async (data: FormData) => {
    const id = generateCybotKey(auth.user?.userId);
    await dispatch(
      write({
        data: {
          ...data,
          id,
          type: DataType.CYBOT,
          userId: auth.user?.userId,
        },
        customId: id,
      })
    ).unwrap();

    await createNewDialog({ cybots: [id] });
  };
  return {
    form,
    provider,
    isPrivate,
    isEncrypted,
    useServerProxy,
    onSubmit,
  };
};
