import React, { useState, useContext } from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "ui";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { createZodSchemaFromDSL } from "database/schema/createZodSchemaFromDSL";
import { FormField } from "components/Form/FormField";
import { createFieldsFromDSL } from "components/Form/createFieldsFromDSL";
import { UserContext } from "../UserContext";
import { handleSignup } from "../client/signUp";

const Register: React.FC = () => {
  const { signup } = useContext(UserContext);

  const { t } = useTranslation();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const onSubmit = async (user) => {
    try {
      setLoading(true);
      const { token } = await handleSignup(user);
      signup(token);
    } catch (error) {
      console.error(error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const userDefinition = {
    username: { type: "string" },
    password: { type: "string" },
  };

  const userFormSchema = createZodSchemaFromDSL(userDefinition);
  const fields = createFieldsFromDSL(userDefinition);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(userFormSchema),
  });
  return (
    <div>
      <div className=" flex items-center justify-center ">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white w-96 rounded-lg shadow-lg p-8"
        >
          <h2 className="text-xl font-bold mb-4">{t("signup")}</h2>
          {fields.map((field) => (
            <FormField
              {...field}
              key={field.id}
              register={register}
              errors={errors}
            />
          ))}
          {error && <p className="text-red-500 text-sm mt-2 mb-2">{error}</p>}
          {loading ? (
            <button
              type="submit"
              className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
              disabled
            >
              <Icon name="spinner" />
              {t("submitting")}
            </button>
          ) : (
            <button
              type="submit"
              className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
            >
              {t("submit")}
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default Register;
