import { ServerIcon } from "@primer/octicons-react";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector, useFetchData } from "app/hooks";
import { upsertData } from "database/dbSlice";
import { selectCurrentUserId } from "auth/authSlice";
import { PageLoader } from "render/blocks/PageLoader";
import { Input } from "web/form/Input";
import { Button } from "web/ui/Button";
import { generateCustomId } from "core/generateMainKey";
import ToggleSwitch from "render/ui/ToggleSwitch";
import { useForm, Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { selectCurrentServer, selectSyncServers } from "../settingSlice";
import { useTheme } from "app/theme";

const Sync = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const userId = useAppSelector(selectCurrentUserId);
  const currentServer = useAppSelector(selectCurrentServer);
  const syncServers = useAppSelector(selectSyncServers);
  const dispatch = useAppDispatch();

  const id = generateCustomId(userId, "sync-settings");
  const { data, isLoading } = useFetchData(id);

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting }
  } = useForm({
    defaultValues: data,
  });

  useEffect(() => {
    reset({ ...data, currentServer });
  }, [data, currentServer, reset]);

  const onSubmit = async (data) => {
    await dispatch(upsertData({ id, data: data }));
  };

  if (isLoading) return <PageLoader />;

  return (
    <>
      <style >{`
        .sync-container {
          max-width: 600px;
          margin: 0 auto;
          padding: 24px;
        }

        .section-title {
          font-size: 24px;
          font-weight: 600;
          margin-bottom: 32px;
          color: ${theme.text};
        }

        .form-section {
          background: ${theme.backgroundSecondary};
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 24px;
        }

        .form-group {
          margin-bottom: 24px;
        }

        .form-group:last-child {
          margin-bottom: 0;
        }

        .form-label {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
          font-weight: 500;
          color: ${theme.text};
        }

        .label-description {
          font-size: 13px;
          color: ${theme.textSecondary};
          margin-bottom: 12px;
        }

        .server-list {
          background: ${theme.background};
          border-radius: 8px;
          padding: 4px;
          margin-top: 8px;
        }

        .server-item {
          padding: 10px 12px;
          margin: 4px;
          border-radius: 6px;
          background: ${theme.backgroundSecondary};
          color: ${theme.textSecondary};
          font-size: 14px;
        }

        .actions {
          display: flex;
          justify-content: flex-end;
          margin-top: 32px;
        }

        .auto-sync-wrapper {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px;
          background: ${theme.background};
          border-radius: 8px;
          margin-bottom: 24px;
        }

        .auto-sync-label {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .auto-sync-title {
          font-weight: 500;
          color: ${theme.text};
        }

        .auto-sync-description {
          font-size: 13px;
          color: ${theme.textSecondary};
        }
      `}</style>

      <div className="sync-container">
        <h2 className="section-title">
          {t('sync.title', '同步设置')}
        </h2>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="auto-sync-wrapper">
            <div className="auto-sync-label">
              <span className="auto-sync-title">
                {t('sync.autoSync', '自动同步')}
              </span>
              <span className="auto-sync-description">
                {t('sync.autoSyncDescription', '启用后将自动与其他服务器同步数据')}
              </span>
            </div>
            <Controller
              name="isAutoSync"
              control={control}
              render={({ field }) => (
                <ToggleSwitch {...field} />
              )}
            />
          </div>

          <div className="form-section">
            <div className="form-group">
              <label className="form-label">
                <ServerIcon size={16} />
                {t('sync.mainServer', '主服务器')}
              </label>
              <Input
                {...register('currentServer')}
                readOnly
                defaultValue={currentServer}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                {t('sync.backupServers', '备份服务器')}
              </label>
              <div className="label-description">
                {t('sync.backupDescription', '当前已配置的备份服务器列表')}
              </div>
              <div className="server-list">
                {syncServers.map((server, index) => (
                  <div key={index} className="server-item">
                    {server}
                  </div>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                {t('sync.customServer', '自定义服务器')}
              </label>
              <div className="label-description">
                {t('sync.customServerDescription', '添加您的自定义同步服务器地址')}
              </div>
              <Input
                {...register('customServers')}
                placeholder={t('sync.enterCustomServer', '请输入服务器地址')}
                defaultValue={data?.customServers}
              />
            </div>
          </div>

          <div className="actions">
            <Button
              type="submit"
              variant="primary"
              loading={isSubmitting}
            >
              {t('common.save', '保存设置')}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
};

export default Sync;
