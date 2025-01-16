// hooks/useCreateCybotValidation.ts
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAppDispatch } from "app/hooks";
import { DataType } from "create/types";
import { write } from "database/dbSlice";
import { useAuth } from "auth/hooks/useAuth";
import { createCybotSchema, FormData } from "../createCybotSchema";
import { useCreateDialog } from "chat/dialog/useCreateDialog";
import { createCybotKey } from "database/keys";

export const useCreateCybotValidation = () => {
  const dispatch = useAppDispatch();
  const { createNewDialog } = useCreateDialog();
  const auth = useAuth();

  const form = useForm<FormData>({
    resolver: zodResolver(createCybotSchema),
    defaultValues: {
      tools: [],
      isPublicInCommunity: false,
      provider: "",
      customProviderUrl: "",
      model: "",
      useServerProxy: true,
    },
  });

  const { watch } = form;
  const provider = watch("provider");
  const useServerProxy = watch("useServerProxy");
  const isPublicInCommunity = watch("isPublicInCommunity");

  const onSubmit = async (data: FormData) => {
    const id = createCybotKey(auth.user?.userId);
    await dispatch(
      write({
        data: {
          ...data,
          id,
          type: DataType.CYBOT,
        },
        customId: id,
      })
    ).unwrap();

    await createNewDialog({ cybots: [id] });
  };

  return {
    form,
    provider,
    useServerProxy,
    isPublicInCommunity,
    onSubmit,
  };
};
