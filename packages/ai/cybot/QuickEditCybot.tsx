import { useAppDispatch } from "app/hooks";
import { DataType } from "create/types";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Button } from "web/ui/Button";
import ToggleSwitch from "render/ui/ToggleSwitch";
import { SyncIcon } from "@primer/octicons-react";
import { FormFieldComponent } from "render/CommonFormComponents";
import { FormField } from "render/form/FormField";
import { Label } from "render/form/Label";
import { Select } from "render/form/Select";
import { patchData } from "database/dbSlice";
import { getModelsByProvider, providerOptions } from "../llm/providers";
import type { Model } from "../llm/types";
import ToolSelector from "../tools/ToolSelector";
import { pick } from "rambda";

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
		const allowedKeys = ["name", "prompt", "provider", "model", "apiKey", "useServerProxy", "isPrivate", "isEncrypted", "tools"];
		const changes = pick(allowedKeys, submitData);

		await dispatch(patchData({
			id: initialValues.id,
			changes,
		}));
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
          
          @media (max-width: 768px) {
            .field-container {
              flex-direction: column;
              align-items: flex-start;
            }
            
            .field-label {
              width: 100%;
              margin-bottom: 8px;
            }
            
            .field-input {
              width: 100%;
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
            
            .field-input {
              width: 70%;
            }
          }

          .input-base {
            width: 100%;
          }

          .textarea-base {
            width: 100%;
            min-height: 100px;
          }
        `}
			</style>

			<form onSubmit={handleSubmit(onSubmit)}>
				<div className="field-container">
					<label htmlFor="name" className="field-label">
						{t("cybotName")}
					</label>
					<div className="field-input">
						<input
							id="name"
							type="text"
							{...register("name", { required: "Name is required" })}
							className="input-base"
						/>
						{errors.name && <span>{errors.name.message}</span>}
					</div>
				</div>

				<div className="field-container">
					<label htmlFor="prompt" className="field-label">
						{t("prompt")}
					</label>
					<div className="field-input">
						<textarea
							id="prompt"
							{...register("prompt")}
							className="textarea-base"
						/>
						{errors.prompt && <span>{errors.prompt.message}</span>}
					</div>
				</div>

				<FormField>
					<Label htmlFor="provider">{t("provider")}:</Label>
					<Select id="provider" {...register("provider")}>
						{providerOptions.map((p) => (
							<option key={p} value={p}>
								{p}
							</option>
						))}
					</Select>
				</FormField>

				<FormField>
					<Label htmlFor="model">{t("model")}:</Label>
					<Select id="model" {...register("model")}>
						{models.map((model) => (
							<option key={model.name} value={model.name}>
								{model.name}
								{model.hasVision && ` (${t("supportsVision")})`}
							</option>
						))}
					</Select>
				</FormField>

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

				<ToolSelector
					register={register}
					containerClassName="field-container"
					labelClassName="field-label"
					inputClassName="field-input"
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

export default QuickEditCybot;
