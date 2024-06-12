import React from "react";
import { useAuth } from "auth/useAuth";
import { TrophyIcon } from "@primer/octicons-react";
import { generateIdWithCustomId } from "core/generateMainKey";
import { useAppDispatch, useAppSelector, useFetchData } from "app/hooks";
import { selectCurrentUserId } from "auth/authSlice";
import { PageLoader } from "render/blocks/PageLoader";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

const UserProfile = () => {
  const auth = useAuth();
  const { t } = useTranslation();

  const customId = "user-profile";
  const userId = useAppSelector(selectCurrentUserId);
  const flags = { isJSON: true };
  const id = generateIdWithCustomId(userId, customId, flags);
  const { data, isLoading } = useFetchData(id);
  if (isLoading) {
    return <PageLoader />;
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: data,
  });

  return (
    <div>
      <h3 className="mb-4 ">个人资料</h3>
      <div className="mb-4">
        <p className="mb-2 ">用户名: {auth.user?.username}</p>
        <p className="mb-2 ">用户Id: {auth.user?.userId}</p>
        <p className="mb-2 ">当前语言: {navigator.language}</p>
        <div className="flex flex-col space-y-4">
          <input
            type="text"
            placeholder="Avatar URL"
            value={data?.avatar || ""}
            className="rounded border p-2"
          />
          <textarea
            placeholder="Self Introduction"
            value={data?.introduction || ""}
            className="rounded border p-2"
          />
          <input
            type="text"
            placeholder="Personal Website"
            value={data?.website || ""}
            className="rounded border p-2"
          />
        </div>
      </div>

      {/* <h2>
         成就
        <TrophyIcon size={24} />
      </h2> */}
      <button type="submit">{t("save")}</button>
    </div>
  );
};

export default UserProfile;
