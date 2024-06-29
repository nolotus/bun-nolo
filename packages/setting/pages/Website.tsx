import React from "react";
import OpenProps from "open-props";
import { useAppDispatch, useAppSelector, useFetchData } from "app/hooks";
import { useForm } from "react-hook-form";
import { TextField } from "render/ui/Form/TextField";
import { useTranslation } from "react-i18next";
import { generateCustomId } from "core/generateMainKey";
import { nolotusId } from "core/init";
import { upsertData } from "database/dbSlice";
import { selectCurrentUserId } from "auth/authSlice";

const Website = () => {
  const dispatch = useAppDispatch();

  const { t } = useTranslation();
  const userId = useAppSelector(selectCurrentUserId);

  const id = generateCustomId(userId, "website-settings");
  const { data, isLoading } = useFetchData(id);
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: data,
  });
  const onSubmit = async (data) => {
    console.log("onSubmit data", data);
    try {
      //save for person
      await dispatch(upsertData({ id, data: data }));
      const nolotusSaveId = generateCustomId(nolotusId, "domain-list", {
        isObject: true,
      });
      //save domain list
      const writeAction = await dispatch(
        upsertData({
          id: nolotusSaveId,
          data: {
            [data.domain]: userId,
          },
        }),
      );
      console.log("writeAction", writeAction);
    } catch (error) {
      // 这里可以处理错误，例如显示一个错误信息
      console.error("Error updating entry:", error);
    }
  };
  return (
    <div style={{ gap: OpenProps.sizeFluid2, marginTop: OpenProps.size3 }}>
      <div>
        <form onSubmit={handleSubmit(onSubmit)}>
          网站域名
          <TextField
            id={"domain"}
            register={register}
            defaultValue={data?.domain}
          />
          <button type="submit">{t("save")}</button>
        </form>
      </div>

      <div>分类</div>
    </div>
  );
};
export default Website;
