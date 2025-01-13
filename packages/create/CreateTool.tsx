import { useAppDispatch, useAppSelector } from "app/hooks";
import { formatISO } from "date-fns";
import { patchData } from "database/dbSlice";
import {
  selectPageData,
  selectIsReadOnly,
  toggleReadOnly,
} from "render/page/pageSlice";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router";
import { CheckIcon } from "@primer/octicons-react";
import DeleteButton from "chat/web/DeleteButton";
import Button from "web/ui/Button";
import ToggleSwitch from "web/ui/ToggleSwitch";
import { useTheme } from "app/theme";

export const CreateTool = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const pageData = useAppSelector(selectPageData);
  const isReadOnly = useAppSelector(selectIsReadOnly);
  const { pageId } = useParams();

  const handleToggleEdit = (checked: boolean) => {
    dispatch(toggleReadOnly());
    navigate(`/${pageId}${!checked ? "" : "?edit=true"}`);
  };

  const handleSave = async () => {
    const nowISO = formatISO(new Date());
    try {
      const title =
        pageData.slateData.find((node) => node.type === "heading-one")
          ?.children[0]?.text || "";

      const saveData = {
        updated_at: nowISO,
        slateData: pageData.slateData,
        title,
      };

      const result = await dispatch(
        patchData({ id: pageId, changes: saveData })
      ).unwrap();

      if (result) {
        toast.success("保存成功");
        handleToggleEdit(false);
      }
    } catch (error) {
      console.error(error);
      toast.error("保存失败");
    }
  };

  return (
    <>
      <div className="tools-container">
        <div className="left-group">
          <DeleteButton id={pageId} />
          <div className="mode-switch">
            <ToggleSwitch
              checked={!isReadOnly}
              onChange={handleToggleEdit}
              ariaLabelledby="edit-mode-toggle"
            />
            <span id="edit-mode-toggle" className="mode-label">
              {isReadOnly ? "阅读模式" : "编辑模式"}
            </span>
          </div>
        </div>

        <div className="right-group">
          <div className="save-button-wrapper">
            <Button
              variant="primary"
              icon={<CheckIcon size={16} />}
              onClick={handleSave}
              size="medium"
              style={{
                opacity: isReadOnly ? 0 : 1,
                pointerEvents: isReadOnly ? "none" : "auto",
              }}
            >
              保存
            </Button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .tools-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 16px;
          border-bottom: 1px solid ${theme.border};
          background: ${theme.background};
          min-height: 48px;
        }

        .left-group,
        .right-group {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .mode-switch {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 4px 8px;
          border-radius: 6px;
          background: ${theme.backgroundSecondary};
        }

        .mode-label {
          font-size: 14px;
          color: ${theme.textSecondary};
          user-select: none;
          min-width: 56px;
        }

        .save-button-wrapper {
          min-width: 88px; /* 保存按钮的固定宽度 */
        }

        :global(.tools-container button) {
          transition: all 0.2s ease;
        }

        :global(.save-button-wrapper button) {
          transition: opacity 0.2s ease;
        }

        :global(.tools-container button:hover) {
          transform: translateY(-1px);
        }
      `}</style>
    </>
  );
};
