import { useAppDispatch } from "app/hooks";
import { DataType } from "create/types";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { setData } from "database/dbSlice";
import { allModels } from "../llm/models";


import { FormField } from "web/form/FormField";
import { Input } from "web/form/Input";
import Textarea from "web/form/Textarea";
import { Select } from "web/form/Select";
import Button from "web/ui/Button";
import ToggleSwitch from "web/form/ToggleSwitch";
import { SyncIcon } from "@primer/octicons-react";
import ToolSelector from "../tools/ToolSelector";


export const modelEnum = Object.keys(allModels).reduce(
	(acc, key) => {
		acc[key] = key;
		return acc;
	},
	{} as { [key: string]: string },
);


const EditCybot = ({ initialValues, onClose }) => {
	const { t } = useTranslation('ai');
	const dispatch = useAppDispatch();


	const modelOptions = useMemo(() => {
		const predefinedOptions = Object.entries(modelEnum).map(([key, value]) => ({
			value: `predefined:${value}`,
			label: key,
		}));
		return [{ label: t("predefinedModels"), options: predefinedOptions }];
	}, [t]);


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
			introduction: initialValues.introduction || "",
			greeting: initialValues.greeting || "",
			prompt: initialValues.prompt || "",
			model: initialValues.model || "",
			tools: initialValues.tools || [],
			isPrivate: initialValues.isPrivate || false,
			isEncrypted: initialValues.isEncrypted || false,
		},
	});


	const isPrivate = watch("isPrivate");
	const isEncrypted = watch("isEncrypted");


	useEffect(() => {
		reset({
			...initialValues,
			name: initialValues.name || "",
			introduction: initialValues.introduction || "",
			greeting: initialValues.greeting || "",
			prompt: initialValues.prompt || "",
			model: initialValues.model || "",
			tools: initialValues.tools || [],
			isPrivate: initialValues.isPrivate || false,
			isEncrypted: initialValues.isEncrypted || false,
		});
	}, [reset, initialValues]);


	const onSubmit = async (data) => {
		const [modelType, modelValue] = data.model.split(":");
		const modelData =
			modelType === "user" ? { llmId: modelValue } : { model: modelValue };
		const submitData = { ...data, ...modelData, type: DataType.Cybot };
		console.log("data", data);
		const action = await dispatch(
			setData({ id: initialValues.id, data: submitData }),
		);
		console.log("action", action);
		onClose();
	};


	return (
		<form onSubmit={handleSubmit(onSubmit)}>
			<FormField label={t("cybotName")} required error={errors.name?.message}>
				<Input
					{...register("name", { required: t("nameRequired") })}
				/>
			</FormField>


			<FormField label={t("greetingMessage")} error={errors.greeting?.message}>
				<Input
					{...register("greeting")}
				/>
			</FormField>


			<FormField label={t("selfIntroduction")} error={errors.introduction?.message}>
				<Textarea
					{...register("introduction")}
				/>
			</FormField>


			<FormField label={t("prompt")} error={errors.prompt?.message}>
				<Textarea
					{...register("prompt")}
				/>
			</FormField>


			{initialValues.model && (
				<FormField label={t("model")} required error={errors.model?.message}>
					<Select
						{...register("model", { required: t("modelRequired") })}
					>
						<option value="">{t("selectModel")}</option>
						{modelOptions.map((group) => (
							<optgroup key={group.label} label={group.label}>
								{group.options.map((option) => (
									<option key={option.value} value={option.value}>
										{option.label}
									</option>
								))}
							</optgroup>
						))}
					</Select>
				</FormField>
			)}


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


export default EditCybot;
