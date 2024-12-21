import { t } from "i18next";
import { createFieldsFromDSL } from "render/ui/Form/createFieldsFromDSL";
import z from "zod";

export const userFormSchema = z.object({
	username: z.string().nonempty({ message: t("usernameRequired") || "" }),
	password: z.string().nonempty({ message: t("passwordRequired") || "" }),
});

const signInDSL = {
	username: {
		type: "string",
		min: 1,
	},
	password: {
		type: "password",
		min: 6,
	},
};
export const signInFields = createFieldsFromDSL(signInDSL);
