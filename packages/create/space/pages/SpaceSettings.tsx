import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTheme } from "app/theme";
import { useAppDispatch, useAppSelector } from "app/store";
import { updateSpace, deleteSpace, fixSpace } from "create/space/spaceSlice";
import { setSettings, selectDefaultSpaceId } from "app/settings/settingSlice";
import { useSpaceData } from "../hooks/useSpaceData";
import { useTranslation } from "react-i18next";

//web
import Button from "render/web/ui/Button";
import { ConfirmModal } from "render/web/ui/modal/ConfirmModal";
import toast from "react-hot-toast";

import { Input } from "render/web/form/Input";
import { TextArea } from "render/web/form/TextArea";

import { FaCog, FaLock, FaGlobe, FaExclamationTriangle } from "react-icons/fa";
import { TrashIcon, PencilIcon, StarFillIcon } from "@primer/octicons-react";

const SpaceSettings: React.FC = () => {
  const theme = useTheme();
  const { spaceId } = useParams<{ spaceId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { t } = useTranslation("space");

  const { spaceData, loading, error } = useSpaceData(spaceId!);
  const [name, setSpaceName] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState<"public" | "private">("private");
  const [updating, setUpdating] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [isRepairing, setIsRepairing] = useState(false);
  const [isSettingDefault, setIsSettingDefault] = useState(false);
  const [inputErrors, setInputErrors] = useState({ name: "", description: "" });

  const currentDefaultSpaceId = useAppSelector(selectDefaultSpaceId);
  const isCurrentDefault = spaceId === currentDefaultSpaceId;

  // 初始化状态
  useEffect(() => {
    if (spaceData) {
      setSpaceName(spaceData.name || "");
      setDescription(spaceData.description || "");
      setVisibility(spaceData.visibility || "private");
    }
  }, [spaceData]);

  // 检测更改
  useEffect(() => {
    if (spaceData) {
      const hasChanges =
        name !== spaceData.name ||
        description !== spaceData.description ||
        visibility !== spaceData.visibility;
      setHasChanges(hasChanges);
    }
  }, [name, description, visibility, spaceData]);

  const handleRepair = async () => {
    setIsRepairing(true);
    try {
      await dispatch(fixSpace(spaceId)).unwrap();
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success(t("repair_success"));
    } catch (err) {
      console.error("Repair error:", err);
      toast.error(
        `${t("repair_error")}: ${err instanceof Error ? err.message : t("try_later")}`
      );
    } finally {
      setIsRepairing(false);
    }
  };

  const handleDelete = async () => {
    if (!spaceId) return;
    try {
      await dispatch(deleteSpace(spaceId)).unwrap();
      toast.success(t("delete_success"));
      navigate("/");
      //todo
    } catch (err) {
      console.error("Delete space error:", err);
      toast.error(
        `${t("delete_error")}: ${err instanceof Error ? err.message : t("try_later")}`
      );
    } finally {
      setShowDeleteModal(false);
    }
  };

  const validateInputs = () => {
    let isValid = true;
    const errors = { name: "", description: "" };

    if (!name.trim()) {
      errors.name = t("name_required");
      isValid = false;
    }

    if (description.length > 500) {
      errors.description = t("description_too_long");
      isValid = false;
    }

    setInputErrors(errors);
    return isValid;
  };

  const handleUpdate = async () => {
    if (!spaceData || !spaceId || !validateInputs()) return;
    if (!hasChanges) {
      return;
    }
    setUpdating(true);
    try {
      await dispatch(
        updateSpace({
          spaceId: spaceId,
          name,
          description,
          visibility,
        })
      ).unwrap();
      toast.success(t("update_success"));
      setHasChanges(false);
    } catch (err) {
      console.error("Update space error:", err);
      toast.error(
        `${t("update_error")}: ${err instanceof Error ? err.message : t("try_later")}`
      );
    } finally {
      setUpdating(false);
    }
  };

  const handleSetDefault = async () => {
    if (!spaceId || isCurrentDefault || isSettingDefault || updating) {
      return;
    }
    setIsSettingDefault(true);
    try {
      await dispatch(setSettings({ defaultSpaceId: spaceId })).unwrap();
      toast.success(`"${name || t("this_space")}" ${t("set_default_success")}`);
    } catch (err) {
      console.error("Set default space error:", err);
      toast.error(
        `${t("set_default_error")}: ${err instanceof Error ? err.message : t("try_later")}`
      );
    } finally {
      setIsSettingDefault(false);
    }
  };

  const handleCancelChanges = () => {
    if (spaceData) {
      setSpaceName(spaceData.name || "");
      setDescription(spaceData.description || "");
      setVisibility(spaceData.visibility || "private");
      setHasChanges(false);
    }
  };

  const handleInputChange = (e, setter) => {
    setter(e.target.value);
  };

  if (loading) {
    return (
      <div className="loading-state">
        <div className="loading-spinner"></div>
        <span>{t("loading")}</span>
      </div>
    );
  }

  return (
    <div className="space-settings">
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title={t("delete_space")}
        message={t("delete_confirm_message")}
        status="error"
        confirmText={t("delete")}
        cancelText={t("cancel")}
      />

      <div className="settings-header">
        <div className="section-title-container">
          <div className="section-icon">
            <FaCog />
          </div>
          <h2 className="section-title">{t("space_settings")}</h2>
          <Button
            onClick={handleRepair}
            loading={isRepairing}
            disabled={isRepairing}
            status="error"
            variant="secondary"
            icon={<FaCog />}
            style={{ marginLeft: "12px" }}
            aria-label={t("try_repair")}
          >
            {t("try_repair")}
          </Button>
        </div>
        {hasChanges && (
          <div className="settings-changes-badge">{t("unsaved_changes")}</div>
        )}
      </div>

      {error || !spaceData ? (
        <div className="error-container">
          <div className="error-state">
            <div className="error-icon">
              <FaExclamationTriangle />
            </div>
            <h3>{t("load_error_title")}</h3>
            <p>
              {error
                ? error instanceof Error
                  ? error.message
                  : String(error)
                : t("no_space_data")}
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="settings-card">
            <div className="card-header">
              <h3 className="card-title">{t("basic_info")}</h3>
              <p className="card-description">{t("manage_basic_info")}</p>
            </div>
            <div className="card-content">
              <div className="form-group">
                <label htmlFor="space-name-input">{t("name")}</label>
                <Input
                  id="space-name-input"
                  type="text"
                  value={name}
                  onChange={(e) => handleInputChange(e, setSpaceName)}
                  placeholder={t("name_placeholder")}
                  aria-required="true"
                  aria-invalid={!!inputErrors.name}
                  aria-describedby="name-error"
                />
                {inputErrors.name && (
                  <div id="name-error" className="error-message">
                    {inputErrors.name}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="space-description-input">
                  {t("description")}
                </label>
                <TextArea
                  id="space-description-input"
                  value={description}
                  onChange={(e) => handleInputChange(e, setDescription)}
                  placeholder={t("description_placeholder")}
                  rows={4}
                  aria-invalid={!!inputErrors.description}
                  aria-describedby="description-error"
                />
                {inputErrors.description && (
                  <div id="description-error" className="error-message">
                    {inputErrors.description}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="settings-card">
            <div className="card-header">
              <h3 className="card-title">{t("access_permission")}</h3>
              <p className="card-description">{t("manage_access")}</p>
            </div>
            <div className="card-content">
              <div
                className="visibility-options"
                role="radiogroup"
                aria-labelledby="visibility-label"
              >
                <h4 id="visibility-label" className="sr-only">
                  {t("select_visibility")}
                </h4>
                <div
                  className={`visibility-option ${
                    visibility === "private" ? "selected" : ""
                  }`}
                  onClick={() => setVisibility("private")}
                  role="radio"
                  aria-checked={visibility === "private"}
                  tabIndex={0}
                  onKeyPress={(e) =>
                    (e.key === "Enter" || e.key === " ") &&
                    setVisibility("private")
                  }
                >
                  <div className="option-radio">
                    {visibility === "private" && (
                      <div className="radio-inner"></div>
                    )}
                  </div>
                  <div className="option-icon private">
                    <FaLock />
                  </div>
                  <div className="option-content">
                    <div className="option-title">{t("private")}</div>
                    <div className="option-description">
                      {t("private_description")}
                    </div>
                  </div>
                </div>
                <div
                  className={`visibility-option ${
                    visibility === "public" ? "selected" : ""
                  }`}
                  onClick={() => setVisibility("public")}
                  role="radio"
                  aria-checked={visibility === "public"}
                  tabIndex={0}
                  onKeyPress={(e) =>
                    (e.key === "Enter" || e.key === " ") &&
                    setVisibility("public")
                  }
                >
                  <div className="option-radio">
                    {visibility === "public" && (
                      <div className="radio-inner"></div>
                    )}
                  </div>
                  <div className="option-icon public">
                    <FaGlobe />
                  </div>
                  <div className="option-content">
                    <div className="option-title">{t("public")}</div>
                    <div className="option-description">
                      {t("public_description")}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="settings-card info-card">
            <div className="card-header">
              <h3 className="card-title">{t("space_details")}</h3>
              <p className="card-description">{t("view_space_details")}</p>
            </div>
            <div className="card-content">
              <div className="info-grid">
                <div className="info-item">
                  <div className="info-label">{t("space_id")}</div>
                  <div className="info-value code">{spaceData.id}</div>
                </div>
                <div className="info-item">
                  <div className="info-label">{t("created_at")}</div>
                  <div className="info-value">
                    {new Date(spaceData.createdAt).toLocaleString()}
                  </div>
                </div>
                <div className="info-item">
                  <div className="info-label">{t("member_count")}</div>
                  <div className="info-value">
                    {spaceData.members
                      ? `${spaceData.members.length} ${t("people")}`
                      : "N/A"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <Button
              onClick={handleUpdate}
              loading={updating}
              disabled={!hasChanges || updating || isSettingDefault}
              icon={<PencilIcon />}
              aria-label={t("save_changes")}
            >
              {t("save_changes")}
            </Button>

            <Button
              onClick={handleSetDefault}
              loading={isSettingDefault}
              disabled={
                isCurrentDefault || isSettingDefault || updating || !spaceId
              }
              icon={<StarFillIcon />}
              variant={isCurrentDefault ? "success" : "secondary"}
              aria-label={
                isCurrentDefault
                  ? t("current_default")
                  : `${t("set_as_default")} ${name || t("this_space")}`
              }
            >
              {isCurrentDefault ? t("current_default") : t("set_as_default")}
            </Button>

            {hasChanges && (
              <button
                type="button"
                className="cancel-button"
                onClick={handleCancelChanges}
                disabled={updating || isSettingDefault}
                aria-label={t("cancel_changes")}
              >
                {t("cancel_changes")}
              </button>
            )}
          </div>

          <div className="danger-section">
            <div className="danger-card">
              <div className="danger-icon">
                <FaExclamationTriangle />
              </div>
              <div className="danger-content">
                <div className="danger-title">{t("delete_space")}</div>
                <div className="danger-description">
                  {t("delete_description")}
                  {spaceData.members && spaceData.members.length > 1 && (
                    <div className="danger-warning">
                      {t("delete_warning", { count: spaceData.members.length })}
                    </div>
                  )}
                </div>
                <Button
                  status="error"
                  onClick={() => setShowDeleteModal(true)}
                  icon={<TrashIcon />}
                  disabled={updating || isSettingDefault}
                  aria-label={t("delete_space")}
                >
                  {t("delete_space")}
                </Button>
              </div>
            </div>
          </div>
        </>
      )}

      <style>{`
        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border-width: 0;
        }

        .space-settings {
          width: 100%;
        }

        .settings-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 12px;
        }

        .section-title-container {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 12px;
        }

        .section-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          background: ${theme.backgroundHover};
          color: ${theme.primary};
          border-radius: 8px;
          margin-right: 12px;
        }

        .section-title {
          font-size: 20px;
          font-weight: 600;
          color: ${theme.text};
          margin: 0;
        }

        .settings-changes-badge {
          background: ${theme.primaryLight};
          color: ${theme.primary};
          padding: 6px 12px;
          border-radius: 16px;
          font-size: 13px;
          font-weight: 500;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% {
            opacity: 0.8;
          }
          50% {
            opacity: 1;
          }
          100% {
            opacity: 0.8;
          }
        }

        .settings-card {
          background: ${theme.background};
          border-radius: 14px;
          box-shadow:
            0 2px 8px ${theme.shadowLight},
            0 0 1px ${theme.shadow1};
          margin-bottom: 24px;
          overflow: hidden;
          transition: box-shadow 0.3s ease;
        }

        .settings-card:hover {
          box-shadow:
            0 4px 12px ${theme.shadowMedium},
            0 0 1px ${theme.shadow2};
        }

        .info-card {
          background: ${theme.backgroundHover};
        }

        .card-header {
          padding: 20px 24px;
          border-bottom: 1px solid ${theme.borderLight};
        }

        .card-title {
          font-size: 18px;
          font-weight: 600;
          color: ${theme.text};
          margin: 0 0 8px 0;
        }

        .card-description {
          font-size: 14px;
          color: ${theme.textSecondary};
          margin: 0;
        }

        .card-content {
          padding: 24px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group:last-child {
          margin-bottom: 0;
        }

        .form-group label {
          display: block;
          font-size: 14px;
          font-weight: 500;
          color: ${theme.textSecondary};
          margin-bottom: 8px;
        }

        .visibility-options {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .visibility-option {
          display: flex;
          align-items: center;
          padding: 16px;
          border-radius: 10px;
          background: ${theme.backgroundHover};
          cursor: pointer;
          transition: all 0.2s;
          border: 2px solid transparent;
        }

        .visibility-option:hover {
          background: ${theme.backgroundTertiary};
        }

        .visibility-option.selected {
          background: ${theme.primaryLight};
          border-color: ${theme.primary};
        }
        .visibility-option:focus-visible {
          outline: 2px solid ${theme.primary};
          outline-offset: 2px;
        }

        .option-radio {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          border: 2px solid ${theme.borderLight};
          margin-right: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .selected .option-radio {
          border-color: ${theme.primary};
        }

        .radio-inner {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: ${theme.primary};
        }

        .option-icon {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 14px;
          flex-shrink: 0;
          font-size: 16px;
        }

        .option-icon.private {
          background: rgba(220, 38, 38, 0.1);
          color: rgb(220, 38, 38);
        }

        .option-icon.public {
          background: rgba(37, 99, 235, 0.1);
          color: rgb(37, 99, 235);
        }

        .option-content {
          flex: 1;
        }

        .option-title {
          font-weight: 600;
          margin-bottom: 4px;
          color: ${theme.text};
          font-size: 15px;
        }

        .option-description {
          font-size: 13px;
          color: ${theme.textSecondary};
          line-height: 1.4;
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 16px;
        }

        .info-item {
          background: ${theme.background};
          padding: 14px 16px;
          border-radius: 10px;
        }

        .info-label {
          font-size: 12px;
          color: ${theme.textTertiary};
          margin-bottom: 6px;
        }

        .info-value {
          font-size: 14px;
          color: ${theme.text};
          word-break: break-all;
          line-height: 1.4;
        }
        .info-value.code {
          font-family: monospace;
          background-color: ${theme.backgroundTertiary};
          padding: 2px 4px;
          border-radius: 4px;
          font-size: 0.9em;
        }

        .form-actions {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 24px 0 40px 0;
        }

        .cancel-button {
          background: none;
          border: none;
          color: ${theme.textSecondary};
          font-size: 14px;
          cursor: pointer;
          padding: 8px 16px;
          border-radius: 6px;
          transition: all 0.2s;
        }

        .cancel-button:hover:not(:disabled) {
          background: ${theme.backgroundTertiary};
          color: ${theme.text};
        }
        .cancel-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .danger-section {
          margin-top: 12px;
        }

        .danger-card {
          display: flex;
          align-items: flex-start;
          padding: 20px;
          background: rgba(220, 38, 38, 0.05);
          border-radius: 14px;
          border-left: 4px solid rgba(220, 38, 38, 0.8);
        }

        .danger-icon {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(220, 38, 38, 0.1);
          color: rgba(220, 38, 38, 0.9);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          margin-right: 16px;
          flex-shrink: 0;
        }

        .danger-content {
          flex: 1;
        }

        .danger-title {
          font-size: 16px;
          font-weight: 600;
          color: rgba(220, 38, 38, 0.9);
          margin-bottom: 8px;
        }

        .danger-description {
          font-size: 14px;
          color: ${theme.textSecondary};
          margin-bottom: 16px;
          line-height: 1.5;
        }

        .danger-warning {
          margin-top: 8px;
          padding: 10px;
          background: rgba(220, 38, 38, 0.08);
          border-radius: 6px;
          font-size: 13px;
          font-weight: 500;
        }

        .loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 200px;
          color: ${theme.textSecondary};
          gap: 16px;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid ${theme.backgroundTertiary};
          border-radius: 50%;
          border-top-color: ${theme.primary};
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .error-container {
          display: flex;
          justify-content: center;
          padding: 40px 0;
        }

        .error-state {
          background: rgba(220, 38, 38, 0.05);
          border-radius: 14px;
          padding: 30px;
          text-align: center;
          max-width: 480px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
        }

        .error-icon {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: rgba(220, 38, 38, 0.1);
          color: rgba(220, 38, 38, 0.9);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          margin: 0 auto 16px auto;
        }

        .error-state h3 {
          color: rgba(220, 38, 38, 0.9);
          font-size: 18px;
          margin-bottom: 10px;
        }

        .error-state p {
          color: ${theme.textSecondary};
          line-height: 1.5;
        }

        .error-message {
          color: ${theme.error};
          font-size: 12px;
          margin-top: 4px;
        }

        @media (max-width: 768px) {
          .visibility-options {
            gap: 12px;
          }

          .visibility-option {
            padding: 14px;
          }

          .card-header,
          .card-content {
            padding: 16px;
          }

          .form-actions {
            flex-direction: column;
            align-items: stretch;
          }

          .form-actions > :global(button),
          .form-actions > .cancel-button {
            width: 100%;
            margin-bottom: 12px;
          }
          .form-actions > :global(button):last-child,
          .form-actions > .cancel-button:last-child {
            margin-bottom: 0;
          }

          .cancel-button {
            text-align: center;
          }

          .info-grid {
            grid-template-columns: 1fr;
          }

          .danger-card {
            flex-direction: column;
            align-items: stretch;
          }

          .danger-icon {
            margin-bottom: 16px;
            margin-right: 0;
            align-self: center;
          }
          .settings-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }
          .settings-changes-badge {
            align-self: flex-start;
          }
        }
      `}</style>
    </div>
  );
};

export default SpaceSettings;
