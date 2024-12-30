import { zodResolver } from "@hookform/resolvers/zod";
import { useAppDispatch } from "app/hooks";
import { useAuth } from "auth/useAuth";
import { useCreateDialog } from "chat/dialog/useCreateDialog";
import { DataType } from "create/types";
import { write } from "database/dbSlice";
import type React from "react";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { useTheme } from "app/theme";
import { getModelsByProvider, providerOptions } from "../llm/providers";
import type { Model } from "../llm/types";


// web imports
import { FormField } from "web/form/FormField";
import FormTitle from "web/form/FormTitle";
import { Input } from "web/form/Input";
import ToggleSwitch from "web/form/ToggleSwitch";
import { PlusIcon, CheckIcon } from "@primer/octicons-react";
import Select from "../llm/Select";
import Button from "web/ui/Button";
import PasswordInput from "web/form/PasswordInput";
import ToolSelector from "../tools/ToolSelector";
import FormContainer from 'web/form/FormContainer';
import TextArea from "web/form/Textarea";


const schema = z.object({
  name: z.string().min(1, "Cybot name is required"),
  provider: z.string().min(1, "Provider is required"),
  model: z.string().min(1, "Model is required"),
  apiKey: z.string().optional(),
  tools: z.array(z.string()),
  isPrivate: z.boolean(),
  isEncrypted: z.boolean(),
  useServerProxy: z.boolean(),
  prompt: z.string().optional(),
  greeting: z.string().optional(),
  introduction: z.string().optional(),
});


type FormData = z.infer<typeof schema>;


const CreateCybot: React.FC = () => {
  const { t } = useTranslation("ai");
  const dispatch = useAppDispatch();
  const auth = useAuth();
  const { createNewDialog } = useCreateDialog();
  const theme = useTheme();


  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      tools: [],
      isPrivate: false,
      isEncrypted: false,
      provider: "",
      model: "",
      useServerProxy: true,
    },
  });


  const provider = watch("provider");
  const [models, setModels] = useState<Model[]>([]);
  const [providerInputValue, setProviderInputValue] = useState<string>(provider || "");


  useEffect(() => {
    setProviderInputValue(provider || "");
  }, [provider]);


  useEffect(() => {
    const modelsList = getModelsByProvider(providerInputValue);
    setModels(modelsList);
    if (modelsList.length > 0) {
      setValue("model", modelsList[0].name);
    }
  }, [providerInputValue, setValue]);


  const isPrivate = watch("isPrivate");
  const isEncrypted = watch("isEncrypted");
  const useServerProxy = watch("useServerProxy");



  const onSubmit = useCallback(
    async (data: FormData) => {
      console.log("Form data before submission:", data);
      try {
        const writeResult = await dispatch(
          write({
            data: {
              type: DataType.Cybot,
              ...data,
            },
            flags: { isJSON: true },
            userId: auth.user?.userId,
          })
        ).unwrap();
        const cybotId = writeResult.id;

        await createNewDialog({ cybots: [cybotId] });
      } catch (error) {
        console.error("Error creating Cybot:", error);
      }
    },
    [dispatch, auth.user?.userId, createNewDialog]
  );

  return (
    <FormContainer>
      <style>
        {`
          .model-selector-container {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
            margin-bottom: 16px;
          }


          .model-option {
            display: flex;
            justify-content: space-between;
            align-items: center;
          }


          .model-indicators {
            display: flex;
            align-items: center;
            gap: 8px;
          }


          .vision-badge {
            background: ${theme.primaryGhost};
            color: ${theme.primary};
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 12px;
          }


          .check-icon {
            color: ${theme.primary};
          }
        `}
      </style>


      <FormTitle>{t("createCybot")}</FormTitle>

      <form onSubmit={handleSubmit(onSubmit)}>
        <FormField
          label={t("cybotName")}
          required
          error={errors.name?.message}
        >
          <Input
            {...register("name")}
            placeholder={t("enterCybotName")}
          />
        </FormField>


        <div className="model-selector-container">
          <FormField
            label={t("provider")}
            required
            error={errors.provider?.message}
          >
            <Select
              items={providerOptions.map((item) => ({ name: item }))}
              selectedItem={provider ? { name: provider } : undefined}
              onSelectedItemChange={(item) => {
                setValue("provider", item.name);
                setProviderInputValue(item.name);
              }}
              itemToString={(item) => (item ? item.name : "")}
              placeholder={t("selectProvider")}
              allowInput={true}
              onInputChange={(value) => setProviderInputValue(value)}
            />
          </FormField>


          <FormField
            label={t("model")}
            required
            error={errors.model?.message}
          >
            <Select
              items={models}
              selectedItem={models.find((model) => watch("model") === model.name)}
              onSelectedItemChange={(item) => setValue("model", item.name)}
              itemToString={(item) => (item ? item.name : "")}
              renderOptionContent={(item, isHighlighted, isSelected) => (
                <div className="model-option">
                  <span className="model-name">{item.name}</span>
                  <div className="model-indicators">
                    {item.hasVision && (
                      <span className="vision-badge">{t("supportsVision")}</span>
                    )}
                    {isSelected && <CheckIcon size={16} className="check-icon" />}
                  </div>
                </div>
              )}
              placeholder={t("selectModel")}
            />
          </FormField>
        </div>


        <FormField
          label={t("apiKeyField")}
          error={errors.apiKey?.message}
        >
          <PasswordInput
            {...register("apiKey")}
            placeholder={t("enterApiKey")}
          />
        </FormField>


        <FormField label={t("useServerProxy")}>
          <ToggleSwitch
            checked={useServerProxy}
            onChange={(checked) => setValue("useServerProxy", checked)}
            ariaLabelledby="server-proxy-label"
          />
        </FormField>


        <FormField
          label={t("prompt")}
          error={errors.prompt?.message}
        >
          <TextArea
            {...register("prompt")}
            placeholder={t("enterPrompt")}
          />
        </FormField>


        <FormField
          label={t("greetingMessage")}
          error={errors.greeting?.message}
        >
          <Input
            {...register("greeting")}
            placeholder={t("enterGreetingMessage")}
          />
        </FormField>


        <FormField
          label={t("selfIntroduction")}
          error={errors.introduction?.message}
        >
          <TextArea
            {...register("introduction")}
            placeholder={t("enterSelfIntroduction")}
          />
        </FormField>


        <ToolSelector register={register} />


        <FormField label={t("private")}>
          <ToggleSwitch
            checked={isPrivate}
            onChange={(checked) => setValue("isPrivate", checked)}
            ariaLabelledby="private-label"
          />
        </FormField>


        <FormField label={t("encrypted")}>
          <ToggleSwitch
            checked={isEncrypted}
            onChange={(checked) => setValue("isEncrypted", checked)}
            ariaLabelledby="encrypted-label"
          />
        </FormField>


        <Button
          type="submit"
          variant="primary"
          block
          size="large"
          loading={isSubmitting}
          disabled={isSubmitting}
          icon={<PlusIcon />}
        >
          {isSubmitting ? t("updating") : t("update")}
        </Button>
      </form>
    </FormContainer>
  );
};


export default CreateCybot;
