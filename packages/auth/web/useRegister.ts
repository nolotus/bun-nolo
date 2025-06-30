import { useState } from "react";
import { useAppDispatch } from "app/store";
import { signUp } from "auth/authSlice";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

/**
 * 定义注册时需要提交的数据结构
 */
interface RegisterData {
  username: string;
  password: string;
  email?: string;
  inviter?: string;
  inviterCode?: string;
}

/**
 * 处理用户注册逻辑的自定义 Hook
 */
const useRegister = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const [error, setError] = useState<string | null>(null);

  /**
   * 异步处理注册请求
   * @param {RegisterData} data - 用户注册表单数据
   */
  const handleRegister = async (data: RegisterData) => {
    // 每次尝试注册时先清空之前的错误信息
    setError(null);
    try {
      const locale = navigator.language;
      const result = await dispatch(signUp({ ...data, locale })).unwrap();

      // 如果注册成功并返回了 token，则跳转到首页
      if (result.token) {
        navigate("/");
      }
    } catch (err: any) {
      console.error("Register error:", err);
      // 从 unwrap() 抛出的错误中提取 message 属性，如果不存在则使用通用错误提示
      const errorMessage = err?.message || err;
      setError(
        typeof errorMessage === "string" ? errorMessage : t("networkError")
      );
    }
  };

  return { handleRegister, error };
};

export default useRegister;
