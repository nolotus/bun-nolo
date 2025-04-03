// create/space/pages/SpaceSettings.tsx
import React, { useEffect, useState } from "react"; // Import React explicitly
import { useParams, useNavigate } from "react-router-dom";
import { useTheme } from "app/theme";
import { useAppDispatch, useAppSelector } from "app/hooks"; // Import useAppSelector
import { updateSpace, deleteSpace } from "create/space/spaceSlice";
import { setSettings, selectDefaultSpaceId } from "setting/settingSlice"; // Import setSettings and selector
import {
  TrashIcon,
  PencilIcon,
  StarFillIcon, // Import a star icon
  // ShieldLockIcon and GlobeIcon were removed as unused in previous step, keep them removed
} from "@primer/octicons-react";
import Button from "render/web/ui/Button";
import { ConfirmModal } from "web/ui/ConfirmModal";
import toast from "react-hot-toast";
import { Input } from "web/form/Input";
import TextArea from "web/form/Textarea";
import { useSpaceData } from "../hooks/useSpaceData";
import {
  FaCog,
  FaLock,
  FaGlobe,
  // FaInfoCircle removed as unused
  FaExclamationTriangle,
  // FaStar removed as StarFillIcon is used
} from "react-icons/fa";

const SpaceSettings: React.FC = () => {
  const theme = useTheme();
  const { spaceId } = useParams<{ spaceId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // State for space data loading and form fields
  const { spaceData, loading, error } = useSpaceData(spaceId!); // Use non-null assertion carefully
  const [name, setSpaceName] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState<"public" | "private">("private");
  const [updating, setUpdating] = useState(false); // Loading state for main update
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // --- New state and selector for default space ---
  const [isSettingDefault, setIsSettingDefault] = useState(false); // Loading state for set default action
  const currentDefaultSpaceId = useAppSelector(selectDefaultSpaceId); // Get current default from settings slice
  const isCurrentDefault = spaceId === currentDefaultSpaceId; // Check if this space is the default

  useEffect(() => {
    if (spaceData) {
      setSpaceName(spaceData.name);
      setDescription(spaceData.description || "");
      setVisibility(spaceData.visibility);
      // Reset hasChanges when data loads initially
      setHasChanges(false);
    }
    // Add spaceId to dependency array if it can change while component is mounted
  }, [spaceData, spaceId]);

  // Detect if form fields have changes compared to loaded spaceData
  useEffect(() => {
    if (spaceData) {
      setHasChanges(
        name !== spaceData.name ||
          description !== (spaceData.description || "") ||
          visibility !== spaceData.visibility
      );
    }
  }, [name, description, visibility, spaceData]);

  const handleDelete = async () => {
    if (!spaceId) return;
    try {
      await dispatch(deleteSpace(spaceId)).unwrap();
      toast.success("空间已删除");
      navigate("/create"); // Navigate away after deletion
    } catch (err) {
      console.error("Delete space error:", err);
      toast.error(
        `删除失败: ${err instanceof Error ? err.message : "请稍后再试"}`
      );
    } finally {
      setShowDeleteModal(false); // Close modal regardless of outcome
    }
  };

  const handleUpdate = async () => {
    if (!spaceData || !spaceId) return;
    // Prevent update if no changes
    if (!hasChanges) {
      // Optionally show a message or just return
      // toast.info("没有需要保存的更改");
      return;
    }
    setUpdating(true);
    try {
      await dispatch(
        updateSpace({
          // Assuming updateSpace handles partial updates via patch/upsert internally
          spaceId: spaceId,
          // Send all potentially changed fields
          name,
          description,
          visibility,
        })
      ).unwrap();
      toast.success("设置已更新");
      setHasChanges(false); // Reset changes flag after successful save
    } catch (err) {
      console.error("Update space error:", err);
      toast.error(
        `更新失败: ${err instanceof Error ? err.message : "请稍后再试"}`
      );
    } finally {
      setUpdating(false);
    }
  };

  // --- Handler for setting the current space as default ---
  const handleSetDefault = async () => {
    if (!spaceId || isCurrentDefault || isSettingDefault || updating) {
      // Prevent action if already default, or if another action is in progress
      return;
    }
    setIsSettingDefault(true);
    try {
      // Dispatch the setSettings action from settingSlice
      await dispatch(setSettings({ defaultSpaceId: spaceId })).unwrap();
      toast.success(`"${name || "此空间"}" 已设为默认空间`); // Use name if available
      // No need to manually set isCurrentDefault = true, the selector will update
    } catch (err) {
      console.error("Set default space error:", err);
      toast.error(
        `设置默认空间失败: ${err instanceof Error ? err.message : "请稍后再试"}`
      );
    } finally {
      setIsSettingDefault(false);
    }
  };

  // Reset form to original values from spaceData
  const handleCancelChanges = () => {
    if (spaceData) {
      setSpaceName(spaceData.name);
      setDescription(spaceData.description || "");
      setVisibility(spaceData.visibility);
      setHasChanges(false); // Explicitly reset flag
    }
  };

  if (loading) {
    return (
      <div className="loading-state">
        <div className="loading-spinner"></div>
        <span>正在加载空间信息...</span>
      </div>
    );
  }

  return (
    <div className="space-settings">
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="删除空间"
        message="确定要删除该空间吗？此操作不可恢复，空间内的所有文件和数据将被永久删除。"
        status="error"
        confirmText="删除"
        cancelText="取消"
      />

      <div className="settings-header">
        <div className="section-title-container">
          <div className="section-icon">
            <FaCog />
          </div>
          <h2 className="section-title">空间设置</h2>
        </div>
        {hasChanges && (
          <div className="settings-changes-badge">有未保存的更改</div>
        )}
      </div>

      {error || !spaceData ? (
        <div className="error-container">
          <div className="error-state">
            <div className="error-icon">
              <FaExclamationTriangle />
            </div>
            <h3>无法加载空间信息</h3>
            {/* Display error message carefully */}
            <p>
              {error
                ? error instanceof Error
                  ? error.message
                  : String(error)
                : "未找到空间数据"}
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="settings-card">
            <div className="card-header">
              <h3 className="card-title">基本信息</h3>
              <p className="card-description">管理空间的名称、描述等基本信息</p>
            </div>
            <div className="card-content">
              <div className="form-group">
                {/* Use label/input association */}
                <label htmlFor="space-name-input">空间名称</label>
                <Input
                  id="space-name-input" // Match htmlFor
                  type="text"
                  value={name}
                  onChange={(e) => setSpaceName(e.target.value)}
                  placeholder="输入空间名称"
                  aria-required="true"
                />
              </div>

              <div className="form-group">
                {/* Use label/input association */}
                <label htmlFor="space-description-input">空间描述</label>
                <TextArea
                  id="space-description-input" // Match htmlFor
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="描述这个空间的用途..."
                  rows={4}
                />
              </div>
            </div>
          </div>

          <div className="settings-card">
            <div className="card-header">
              <h3 className="card-title">访问权限</h3>
              <p className="card-description">
                设置谁可以访问和查看此空间的内容
              </p>
            </div>
            <div className="card-content">
              {/* Add role="radiogroup" and labelling */}
              <div
                className="visibility-options"
                role="radiogroup"
                aria-labelledby="visibility-label"
              >
                <h4 id="visibility-label" className="sr-only">
                  选择空间可见性
                </h4>{" "}
                {/* Hidden label for group */}
                <div
                  className={`visibility-option ${
                    visibility === "private" ? "selected" : ""
                  }`}
                  onClick={() => setVisibility("private")}
                  role="radio"
                  aria-checked={visibility === "private"}
                  tabIndex={0} // Make focusable
                  onKeyPress={(e) =>
                    (e.key === "Enter" || e.key === " ") &&
                    setVisibility("private")
                  } // Basic keyboard interaction
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
                    <div className="option-title">私有</div>
                    <div className="option-description">
                      只有被邀请的成员可以访问此空间
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
                  tabIndex={0} // Make focusable
                  onKeyPress={(e) =>
                    (e.key === "Enter" || e.key === " ") &&
                    setVisibility("public")
                  } // Basic keyboard interaction
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
                    <div className="option-title">公开</div>
                    <div className="option-description">
                      所有人都可以查看，但只有成员可以编辑内容
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="settings-card info-card">
            <div className="card-header">
              <h3 className="card-title">空间详情</h3>
              <p className="card-description">查看空间的基本信息和元数据</p>
            </div>
            <div className="card-content">
              <div className="info-grid">
                <div className="info-item">
                  <div className="info-label">空间ID</div>
                  {/* Added 'code' class for potential monospace styling if desired */}
                  <div className="info-value code">{spaceData.id}</div>
                </div>
                <div className="info-item">
                  <div className="info-label">创建时间</div>
                  <div className="info-value">
                    {/* Consider using a date formatting library for better localization */}
                    {new Date(spaceData.createdAt).toLocaleString()}
                  </div>
                </div>
                {/* Display ownerId only if truly necessary */}
                {/* <div className="info-item">
                  <div className="info-label">创建者ID</div>
                  <div className="info-value code">{spaceData.ownerId}</div>
                </div> */}
                <div className="info-item">
                  <div className="info-label">成员数量</div>
                  {/* Handle case where members might be null/undefined */}
                  <div className="info-value">
                    {spaceData.members
                      ? `${spaceData.members.length} 人`
                      : "N/A"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* --- Form Actions with added "Set Default" button --- */}
          <div className="form-actions">
            <Button
              onClick={handleUpdate}
              loading={updating}
              // Disable if no changes or another action is running
              disabled={!hasChanges || updating || isSettingDefault}
              icon={<PencilIcon />}
            >
              保存更改
            </Button>

            {/* Add Set as Default Button */}
            <Button
              onClick={handleSetDefault}
              loading={isSettingDefault}
              // Disable if already default, or actions running, or no spaceId
              disabled={
                isCurrentDefault || isSettingDefault || updating || !spaceId
              }
              icon={<StarFillIcon />} // Use the imported star icon
              // Change appearance if default - assumes Button component supports 'success' variant
              variant={isCurrentDefault ? "success" : "secondary"}
              // Add accessibility label
              aria-label={
                isCurrentDefault
                  ? "当前默认空间"
                  : `将 ${name || "此空间"} 设为默认空间`
              }
            >
              {isCurrentDefault ? "当前默认空间" : "设为默认空间"}
            </Button>

            {/* Conditionally render Cancel button only if there are changes */}
            {hasChanges && (
              <button
                type="button" // Specify type for non-submitting button
                className="cancel-button"
                onClick={handleCancelChanges}
                // Disable if actions running
                disabled={updating || isSettingDefault}
              >
                取消更改
              </button>
            )}
          </div>

          <div className="danger-section">
            <div className="danger-card">
              <div className="danger-icon">
                <FaExclamationTriangle />
              </div>
              <div className="danger-content">
                <div className="danger-title">删除空间</div>
                <div className="danger-description">
                  此操作将永久删除空间内的所有文件、页面和数据，无法恢复。
                  {/* Display member count warning only if members exist and count > 1 */}
                  {spaceData.members && spaceData.members.length > 1 && (
                    <div className="danger-warning">
                      注意：此空间有 {spaceData.members.length}{" "}
                      名成员。删除前请确保通知所有成员。
                    </div>
                  )}
                </div>
                <Button
                  status="error"
                  onClick={() => setShowDeleteModal(true)}
                  icon={<TrashIcon />}
                  // Disable delete if other actions are running
                  disabled={updating || isSettingDefault}
                >
                  删除空间
                </Button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* --- Styles (Reverted to original provided styles) --- */}
      <style jsx>{`
        /* Screen reader only class (useful for accessibility) */
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
        }

        .section-title-container {
          display: flex;
          align-items: center;
        }

        .section-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          background: ${theme.backgroundSecondary};
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
            0 2px 8px rgba(0, 0, 0, 0.04),
            0 0 1px rgba(0, 0, 0, 0.08);
          margin-bottom: 24px;
          overflow: hidden;
          transition: box-shadow 0.3s ease;
        }

        .settings-card:hover {
          box-shadow:
            0 4px 12px rgba(0, 0, 0, 0.05),
            0 0 1px rgba(0, 0, 0, 0.1);
        }

        .info-card {
          background: ${theme.backgroundSecondary};
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
          background: ${theme.backgroundSecondary};
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
        /* Basic focus style for keyboard navigation */
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
        /* Optional: Style for code-like text */
        .info-value.code {
          font-family: monospace;
          background-color: ${theme.backgroundTertiary}; /* Subtle background */
          padding: 2px 4px;
          border-radius: 4px;
          font-size: 0.9em; /* Slightly smaller */
        }

        /* Original form actions styles */
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
          padding: 8px 16px; /* Match button padding if possible */
          border-radius: 6px;
          transition: all 0.2s;
          /* Removed margin-left: auto; to keep original layout flow */
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
          margin-top: 12px; /* Original margin */
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
          line-height: 1.5; /* Added for better readability */
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
          height: 200px; /* Original height */
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
          padding: 40px 0; /* Original padding */
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

        /* Original Responsive styles */
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

          /* Adjusted selector to target both Button and cancel-button */
          .form-actions > :global(button),
          .form-actions > .cancel-button {
            width: 100%;
            margin-bottom: 12px; /* Add spacing between stacked buttons */
          }
          /* Remove bottom margin from the last button */
          .form-actions > :global(button):last-child,
          .form-actions > .cancel-button:last-child {
            margin-bottom: 0;
          }

          /* Center the cancel button text when stacked */
          .cancel-button {
            text-align: center;
          }

          .info-grid {
            grid-template-columns: 1fr;
          }

          .danger-card {
            flex-direction: column;
            align-items: stretch; /* Stretch content */
          }

          .danger-icon {
            margin-bottom: 16px;
            margin-right: 0; /* Remove right margin */
            align-self: center; /* Center icon */
          }
          /* Adjust header stacking on mobile */
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
