import { useState } from "react";
import { useAppDispatch } from "app/hooks";
import { signUp } from "auth/authSlice";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

interface RegisterData {
  username: string;
  password: string;
  // 根据需要添加其它字段
}

const useRegister = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async (data: RegisterData) => {
    try {
      const locale = navigator.language;
      const result = await dispatch(signUp({ ...data, locale })).unwrap();
      console.log("Dispatch result:", result);
      if (result.token) {
        navigate("/");
      }
    } catch (err) {
      console.error("Register error:", err);
      setError(typeof err === "string" ? err : t("networkError"));
    }
  };

  return { handleRegister, error };
};

export default useRegister;
