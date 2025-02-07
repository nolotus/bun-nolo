import { useState } from "react";
import { useAppDispatch } from "app/hooks";
import { signUp } from "auth/authSlice";
import { hashPasswordV1 } from "core/password";
import { tokenManager } from "../tokenManager";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const useRegister = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async (data) => {
    try {
      console.log("Register attempt with data:", data); // 日志1: 记录注册尝试的数据
      const locale = navigator.language;
      const { password } = data;
      const encryptionKey = await hashPasswordV1(password);
      console.log("Encryption key generated:", encryptionKey); // 日志2: 记录生成的加密密钥

      const action = await dispatch(signUp({ ...data, locale, encryptionKey }));
      console.log("Dispatch result:", action); // 日志3: 记录dispatch的结果

      if (action.payload.token) {
        tokenManager.storeToken(action.payload.token);
        navigate("/create");
        return;
      }

      switch (action.payload.status) {
        case 409:
          setError(t("userExists"));
          break;
        case 400:
          setError(t("validationError"));
          break;
        case 500:
          setError(t("serverError"));
          break;
        default:
          setError(t("operationFailed"));
      }
    } catch (err) {
      console.error("Network error:", err); // 日志4: 记录网络错误
      setError(t("networkError"));
    }
  };

  return { handleRegister, error };
};

export default useRegister;
