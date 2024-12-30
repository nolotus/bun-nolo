import { useAppDispatch } from "app/hooks";
import { DataType } from "create/types";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { pick } from "rambda";


import Button from "web/ui/Button";
import ToggleSwitch from "web/form/ToggleSwitch";
import { SyncIcon } from "@primer/octicons-react";
import { FormField } from "web/form/FormField";
import { Input } from "web/form/Input";
import Textarea from "web/form/Textarea";
import { Select } from "web/form/Select";
import PasswordInput from "web/form/PasswordInput";


import { patchData } from "database/dbSlice";
import { getModelsByProvider, providerOptions } from "../llm/providers";
import type { Model } from "../llm/types";
import ToolSelector from "../tools/ToolSelector";


const QuickEditCybot = ({ initialValues, onClose }) => {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();


	const {
		register,
		handleSubmit,
		watch,
		setValue,
		formState: { errors, isSubmitting },
		reset,
	} = useForm({
		defaultValues: {
			...initialValues,
			name: initialValues.name || "",
			prompt: initialValues.prompt || "",
			model: initialValues.model || "",
			tools: initialValues.tools || [],
			isPrivate: initialValues.isPrivate || false,
			isEncrypted: initialValues.isEncrypted || false,
		},
	});


	const provider = watch("provider");
	const [models, setModels] = useState<Model[]>([]);
	const isPrivate = watch("isPrivate");
	const isEncrypted = watch("isEncrypted");
	const useServerProxy = watch("useServerProxy");


	useEffect(() => {
		const modelsList = getModelsByProvider(provider);
		setModels(modelsList);
		if (modelsList.length > 0) {
			setValue("model", modelsList[0].name);
		}
	}, [provider, setValue]);


	useEffect(() => {
		reset({
			...initialValues,
			name: initialValues.name || "",
			prompt: initialValues.prompt || "",
			model: initialValues.model || "",
			tools: initialValues.tools || [],
			isPrivate: initialValues.isPrivate || false,
			isEncrypted: initialValues.isEncrypted || false,
		});
	}, [reset, initialValues]);


	const onSubmit = async (data) => {
		const submitData = { ...data, type: DataType.Cybot };
		const allowedKeys = [
			"name",
			"prompt",
			"provider",
			"model",
			"apiKey",
			"useServerProxy",
			"isPrivate",
			"isEncrypted",
			"tools",
		];
		const changes = pick(allowedKeys, submitData);


		await dispatch(
			patchData({
				id: initialValues.id,
				changes,
			})
		);
		onClose();
	};


	return (
		<form onSubmit={handleSubmit(onSubmit)}>
			<FormField
				label={t("cybotName")}
				required
				error={errors.name?.message}
			>
				<Input
					{...register("name", { required: t("nameRequired") })}
				/>
			</FormField>


			<FormField
				label={t("prompt")}
				error={errors.prompt?.message}
			>
				<Textarea
					{...register("prompt")}
				/>
			</FormField>


			<FormField
				label={t("provider")}
			>
				<Select {...register("provider")}>
					{providerOptions.map((p) => (
						<option key={p} value={p}>
							{p}
						</option>
					))}
				</Select>
			</FormField>


			<FormField
				label={t("model")}
			>
				<Select {...register("model")}>
					{models.map((model) => (
						<option key={model.name} value={model.name}>
							{model.name}
							{model.hasVision && ` (${t("supportsVision")})`}
						</option>
					))}
				</Select>
			</FormField>


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


			<FormField label={t("tools")}>
				<ToolSelector
					register={register}
				/>
			</FormField>


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
				icon={<SyncIcon />}
			>
				{isSubmitting ? t("updating") : t("update")}
			</Button>
		</form>
	);
};


export default QuickEditCybot;
