import { useAppDispatch } from "app/hooks";
import { DataType } from "create/types";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { ErrorMessage } from "render/CommonFormComponents";
import { Label } from "web/form/Label";
import { Select } from "web/form/Select";
import { Button } from "web/ui/Button";
import ToggleSwitch from "render/ui/ToggleSwitch";
import { SyncIcon } from "@primer/octicons-react";

import { setData } from "database/dbSlice";
import { FormField } from "render/form/FormField";
import { allModels } from "../llm/models";
import ToolSelector from "../tools/ToolSelector";

export const modelEnum = Object.keys(allModels).reduce(
	(acc, key) => {
		acc[key] = key;
		return acc;
	},
	{} as { [key: string]: string },
);

const EditCybot = ({ initialValues, onClose }) => {
	const { t } = useTranslation();
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
		<>
			<style>
				{`
          .field-container {
            margin-bottom: 16px;
            display: flex;
            gap: 8px;
          }
          
          .input-container {
            width: 100%;
          }
          
          .text-input {
            width: 100%;
          }
          
          .textarea-input {
            width: 100%;
            min-height: 100px;
          }
          
          @media (max-width: 768px) {
            .field-container {
              flex-direction: column;
              align-items: flex-start;
            }
            
            .field-label {
              width: 100%;
              margin-bottom: 8px;
            }
          }
          
          @media (min-width: 769px) {
            .field-container {
              flex-direction: row;
              align-items: center;
            }
            
            .field-label {
              width: 30%;
              margin-bottom: 0;
            }
            
            .input-container {
              width: 70%;
            }
          }
        `}
			</style>

			<form onSubmit={handleSubmit(onSubmit)}>
				<div className="field-container">
					<label htmlFor="name" className="field-label">
						{t("cybotName")}
					</label>
					<div className="input-container">
						<input
							id="name"
							type="text"
							{...register("name", { required: "Name is required" })}
							className="text-input"
						/>
						{errors.name && <span>{errors.name.message}</span>}
					</div>
				</div>

				<div className="field-container">
					<label htmlFor="greeting" className="field-label">
						{t("greetingMessage")}
					</label>
					<div className="input-container">
						<input
							id="greeting"
							type="text"
							{...register("greeting")}
							className="text-input"
						/>
						{errors.greeting && <span>{errors.greeting.message}</span>}
					</div>
				</div>

				<div className="field-container">
					<label htmlFor="introduction" className="field-label">
						{t("selfIntroduction")}
					</label>
					<div className="input-container">
						<textarea
							id="introduction"
							{...register("introduction")}
							className="textarea-input"
						/>
						{errors.introduction && <span>{errors.introduction.message}</span>}
					</div>
				</div>

				<div className="field-container">
					<label htmlFor="prompt" className="field-label">
						{t("prompt")}
					</label>
					<div className="input-container">
						<textarea
							id="prompt"
							{...register("prompt")}
							className="textarea-input"
						/>
						{errors.prompt && <span>{errors.prompt.message}</span>}
					</div>
				</div>

				{initialValues.model && (
					<FormField>
						<Label htmlFor="model">{t("model")}:</Label>
						<Select
							id="model"
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
						{errors.model && <ErrorMessage>{errors.model.message}</ErrorMessage>}
					</FormField>
				)}

				<ToolSelector
					register={register}
					containerClassName="field-container"
					labelClassName="field-label"
					inputClassName="input-container"
				/>

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
		</>
	);
};

export default EditCybot;
