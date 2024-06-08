import z from "zod";
import { t } from "i18next";
import { createFieldsFromDSL } from "ui/Form/createFieldsFromDSL";
import { createZodSchemaFromDSL } from "database/schema/createZodSchemaFromDSL";

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

export const signUpDefinition = {
  username: { type: "string", min: 1 },
  password: { type: "password", min: 6 },
};
export const signUpSchema = createZodSchemaFromDSL(signUpDefinition);
export const signUpfields = createFieldsFromDSL(signUpDefinition);
