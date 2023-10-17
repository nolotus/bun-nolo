import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { UserContext } from "../UserContext";
import { UserMenu } from "./UserMenu";

export const GoUser = () => {
  const { t } = useTranslation();
  const { isLogin } = useContext(UserContext);

  return (
    <div className="flex items-center">
      {isLogin ? (
        <UserMenu />
      ) : (
        <div className="flex items-center">
          <Link to="/login" className="mr-4 text-blue-600 hover:text-blue-800">
            {t("login")}
          </Link>
          <Link
            to="/register"
            className="py-1 px-2 border border-green-400 rounded text-green-600 hover:bg-green-100 hover:text-green-800"
          >
            {t("signup")}
          </Link>
        </div>
      )}
    </div>
  );
};
