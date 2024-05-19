import z from "zod";
import { t } from "i18next";
import { createFieldsFromDSL } from "components/Form/createFieldsFromDSL";

export const userFormSchema = z.object({
  username: z.string().nonempty({ message: t("usernameRequired") || "" }),
  password: z.string().nonempty({ message: t("passwordRequired") || "" }),
});

const loginDSL = {
  username: {
    type: "string",
    min: 1,
  },
  password: {
    type: "password",
    min: 6,
  },
};
export const loginFields = createFieldsFromDSL(loginDSL);
