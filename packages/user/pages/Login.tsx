import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { FormField } from "components/Form/FormField";
import { createFieldsFromDSL } from "components/Form/createFieldsFromDSL";
import { storeTokens } from "auth/client/token";
import { parseToken } from "auth/token";
import { useAppDispatch } from "app/hooks";
import { userFormSchema } from "../schema";
import { userLogin } from "user/userSlice";
import { useLoginMutation } from "app/services/auth";
import { generateUserId } from "core/generateMainKey";
import { generateKeyPairFromSeed } from "core/crypto";
import { hashPassword } from "core/password";
import { signToken } from "auth/token";

const formDSL = {
  username: {
    type: "string",
    min: 1,
  },
  password: {
    type: "password",
    min: 6,
  },
};
const fields = createFieldsFromDSL(formDSL);

const Login: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const [error, setError] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(userFormSchema),
  });

  // const onChange = (name: string, values: string) => {
  //   console.log('value', name, values);
  //   const willSaveData = `${name}:${values}`;
  //   change('3-myNoloConfig', willSaveData);
  // };

  const [login, { isLoading }] = useLoginMutation();
  const onSubmit = async (input) => {
    try {
      // await login(user);
      const { username, password } = input;
      const language = navigator.language;
      const encryptionKey = await hashPassword(password);

      const { publicKey, secretKey } = generateKeyPairFromSeed(
        username + encryptionKey + language
      );
      const userId = generateUserId(publicKey, username, language);

      const token = signToken({ userId, publicKey, username }, secretKey);
      const { token: newToken } = await login({ userId, token }).unwrap();
      const user = parseToken(newToken);
      storeTokens(newToken);
      dispatch(userLogin(user));
      navigate("/welcome");
    } catch (noloError) {
      console.error(noloError);

      let message;
      switch (noloError.message) {
        case "404":
          message = t("errors.userNotFound");
          break;
        case "403":
          message = t("errors.invalidCredentials");
          break;
        case "400":
          message = t("errors.validationError");
          break;
        case "500":
        default:
          message = t("errors.serverError");
          break;
      }

      setError(message);
    }
  };
  return (
    <div>
      <div className="flex items-center justify-center">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white w-96 rounded-lg shadow-lg p-8"
        >
          <h2 className="text-xl font-bold mb-4">{t("login")}</h2>
          {fields.map((field) => (
            <FormField
              {...field}
              key={field.id}
              register={register}
              errors={errors}
            />
          ))}
          {error && <p className="text-red-500 text-sm mt-2 mb-2">{error}</p>}
          <button
            type="submit"
            className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
          >
            {t("submit")}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
