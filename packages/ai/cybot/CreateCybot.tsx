import { zodResolver } from "@hookform/resolvers/zod";
import { useAppDispatch } from "app/hooks";
import { useAuth } from "auth/useAuth";
import { useCreateDialog } from "chat/dialog/useCreateDialog";
import { DataType } from "create/types";
import { write } from "database/dbSlice";
import withTranslations from "i18n/withTranslations";
import type React from "react";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
	FormContainer,
	FormFieldComponent,
	FormTitle,
} from "render/CommonFormComponents";
import { FormField } from "render/form/FormField";
import { Label } from "render/form/Label";
import { Button } from "render/ui/Button";
import ToggleSwitch from "render/ui/ToggleSwitch";
import { z } from "zod";

import ModelSelector from "../llm/ModelSelector";
import { getModelsByProvider } from "../llm/providers"; // 假定 providerOptions 在这个文件中定义
import type { Model } from "../llm/types";
import ToolSelector from "../tools/ToolSelector";

// 定义Zod模式
const schema = z.object({
	name: z.string().nonempty("Cybot name is required"),
	provider: z.string().nonempty("Provider is required"),
	model: z.string().nonempty("Model is required"),
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
	const { t } = useTranslation();
	const dispatch = useAppDispatch();
	const auth = useAuth();
	const { isLoading: isDialogLoading, createNewDialog } = useCreateDialog();

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

	useEffect(() => {
		const modelsList = getModelsByProvider(provider);
		setModels(modelsList);
		if (modelsList.length > 0) {
			setValue("model", modelsList[0].name);
		}
	}, [provider, setValue]);

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
					}),
				).unwrap();
				const cybotId = writeResult.id;

				await createNewDialog({ cybots: [cybotId] });
			} catch (error) {
				console.error("Error creating Cybot:", error);
			}
		},
		[dispatch, auth.user?.userId, createNewDialog],
	);

	return (
		<FormContainer>
			<FormTitle>{t("createCybot")}</FormTitle>
			<form onSubmit={handleSubmit(onSubmit)}>
				<FormFieldComponent
					label={t("cybotName")}
					name="name"
					register={register}
					errors={errors}
					required={t("cybotNameRequired")}
				/>

				<ModelSelector
					register={register}
					setValue={setValue}
					watch={watch}
					errors={errors}
				/>

				<FormFieldComponent
					label={t("apiKeyField")}
					name="apiKey"
					type="password"
					register={register}
					errors={errors}
				/>
				<FormField>
					<Label>{t("useServerProxy")}:</Label>
					<ToggleSwitch
						checked={useServerProxy}
						onChange={(checked) => setValue("useServerProxy", checked)}
						ariaLabelledby="server-proxy-label"
					/>
				</FormField>
				<FormFieldComponent
					label={t("prompt")}
					name="prompt"
					register={register}
					errors={errors}
					as="textarea"
				/>
				<FormFieldComponent
					label={t("greetingMessage")}
					name="greeting"
					register={register}
					errors={errors}
				/>
				<FormFieldComponent
					label={t("selfIntroduction")}
					name="introduction"
					register={register}
					errors={errors}
					as="textarea"
				/>
				<ToolSelector register={register} />
				<FormField>
					<Label>{t("private")}:</Label>
					<ToggleSwitch
						checked={isPrivate}
						onChange={(checked) => setValue("isPrivate", checked)}
						ariaLabelledby="private-label"
					/>
				</FormField>
				<FormField>
					<Label>{t("encrypted")}:</Label>
					<ToggleSwitch
						checked={isEncrypted}
						onChange={(checked) => setValue("isEncrypted", checked)}
						ariaLabelledby="encrypted-label"
					/>
				</FormField>
				<Button
					type="submit"
					disabled={isSubmitting || isDialogLoading}
					style={{ width: "100%", padding: "10px", marginTop: "20px" }}
				>
					{t("createCybot")}
				</Button>
			</form>
		</FormContainer>
	);
};

export default withTranslations(CreateCybot, ["ai"]);
