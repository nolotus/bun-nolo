import StringToArrayInput from "render/ui/Form/StringToArrayInput";
import { ServerIcon } from "@primer/octicons-react";
import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector, useFetchData } from "app/hooks";
import { upsertData } from "database/dbSlice";
import { selectCurrentUserId } from "auth/authSlice";
import { PageLoader } from "render/blocks/PageLoader";
import { TextField } from "render/ui/Form/TextField";
import { generateCustomId } from "core/generateMainKey";
import ToggleSwitch from "render/ui/ToggleSwitch";

// import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { selectCurrentServer, selectSyncServers } from "../settingSlice";

const Sync = () => {
  const { t } = useTranslation();
  const userId = useAppSelector(selectCurrentUserId);
  const dispatch = useAppDispatch();
  const id = generateCustomId(userId, "sync-settings");
  const { data, isLoading } = useFetchData(id);
  if (isLoading) {
    return <PageLoader />;
  }

  const currentServer = useAppSelector(selectCurrentServer);
  const syncServers = useAppSelector(selectSyncServers);

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: data,
  });

  useEffect(() => {
    const initValue = { ...data, currentServer };
    reset(initValue);
  }, [data, currentServer]);

  const onSubmit = async (data) => {
    try {
      await dispatch(upsertData({ id, data: data }));
    } catch (error) {}
  };
  return (
    <div>
      <h2>同步设置</h2>
      <h3
        style={{
          fontSize: "1.2em",
          marginTop: "10px",
          display: "flex",
          alignItems: "center",
        }}
      ></h3>
      <form onSubmit={handleSubmit(onSubmit)}>
        <label style={{ marginRight: "10px" }}>开启自动同步:</label>
        <Controller
          name="isAutoSync"
          control={control}
          render={({ field }) => {
            return <ToggleSwitch {...field} />;
          }}
        />
        <div className="">
          <label>
            <ServerIcon size={24} />
            主服务器
          </label>
          <TextField readOnly id={"currentServer"} register={register} />
        </div>

        <label>备份服务器:</label>
        {syncServers.map((server, index) => (
          <div
            key={index}
            style={{
              padding: "5px",
              marginTop: "5px",
            }}
          >
            {server}
          </div>
        ))}
        <label htmlFor="serverAddress">您的自定义服务器</label>
        <TextField
          {...register("customServers")}
          defaultValue={data?.customServers}
        />
        <button type="submit">{t("save")}</button>
      </form>

      {/* <StringToArrayInput
        {...register("firstName")}
        value={syncServer}
        // onChange={}
        name="serverAddress"
        placeholder="Enter server addresses (comma separated)"
      /> */}
    </div>
  );
};

export default Sync;
