import type { PromptFormData } from "ai/types";
import { useAppDispatch } from "app/hooks";
import { selectTheme } from "app/theme/themeSlice";
import { useAuth } from "auth/useAuth";
import { DataType } from "create/types";
import { write } from "database/dbSlice";
import withTranslations from "i18n/withTranslations";
// CreatePrompt.tsx
import type React from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
	FormContainer,
	FormFieldComponent,
	FormTitle,
	SubmitButton,
} from "render/CommonFormComponents";
import { FormField } from "render/form/FormField";

import { Input } from "render/form/Input";
import { Label } from "render/form/Label";
import { layout } from "render/styles/layout";

const CreatePrompt: React.FC = () => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const dispatch = useAppDispatch();
	const auth = useAuth();
	const theme = useSelector(selectTheme);

	const [tags, setTags] = useState<string[]>([]);
	const [currentTag, setCurrentTag] = useState("");

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<PromptFormData>();

	const addTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter" && currentTag.trim() !== "") {
			e.preventDefault();
			setTags([...tags, currentTag.trim()]);
			setCurrentTag("");
		}
	};

	const onSubmit = async (data: PromptFormData) => {
		const promptData = { ...data, tags };
		console.log(promptData);
		try {
			const writePromptAction = await dispatch(
				write({
					data: { type: DataType.Prompt, ...promptData },
					flags: { isJSON: true },
					userId: auth.user?.userId,
				}),
			);
			const promptId = writePromptAction.payload.id;
			navigate(`/${promptId}`);
		} catch (error) {
			console.error("Error creating Prompt:", error);
		}
	};

	const styles = {
		tagInput: {
			marginBottom: "5px",
		},
		tagContainer: {
			...layout.flex,
			...layout.flexWrap,
			gap: "5px",
			marginTop: "5px",
		},
		tag: {
			backgroundColor: theme.surface3,
			color: theme.text2,
			padding: "2px 8px",
			borderRadius: "4px",
			fontSize: "0.9em",
		},
	};

	return (
		<FormContainer>
			<FormTitle>{t("createPrompt")}</FormTitle>
			<form onSubmit={handleSubmit(onSubmit)}>
				<FormFieldComponent
					label={t("promptName")}
					name="name"
					register={register}
					errors={errors}
					required
				/>
				<FormFieldComponent
					label={t("promptContent")}
					name="content"
					register={register}
					errors={errors}
					required
					as="textarea"
				/>
				<FormFieldComponent
					label={t("category")}
					name="category"
					register={register}
					errors={errors}
				/>
				<FormField>
					<Label htmlFor="tags">{t("tags")}:</Label>
					<Input
						id="tags"
						value={currentTag}
						onChange={(e) => setCurrentTag(e.target.value)}
						onKeyPress={addTag}
						placeholder={t("addTagsPlaceholder")}
						style={styles.tagInput}
					/>
					<div style={styles.tagContainer}>
						{tags.map((tag, index) => (
							<span key={index} style={styles.tag}>
								{tag}
							</span>
						))}
					</div>
				</FormField>
				<SubmitButton type="submit">{t("createPrompt")}</SubmitButton>
			</form>
		</FormContainer>
	);
};

export default withTranslations(CreatePrompt, ["ai"]);
