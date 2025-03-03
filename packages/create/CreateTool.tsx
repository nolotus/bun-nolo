import { useAppDispatch, useAppSelector } from "app/hooks";
import { formatISO } from "date-fns";
import { patchData } from "database/dbSlice";
import {
  selectPageData,
  selectIsReadOnly,
  toggleReadOnly,
} from "render/page/pageSlice";
import { updateContentTitle } from "create/space/spaceSlice"; // 导入 updateContentCategory
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router";
import { CheckIcon } from "@primer/octicons-react";
import DeleteButton from "chat/web/DeleteButton";
import Button from "web/ui/Button";
import { useTheme } from "app/theme";
import ModeToggle from "web/ui/ModeToggle";

export const CreateTool = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const pageData = useAppSelector(selectPageData);
  const isReadOnly = useAppSelector(selectIsReadOnly);
  const { pageId: dbKey } = useParams();

  const handleToggleEdit = (checked: boolean) => {
    dispatch(toggleReadOnly());
    navigate(`/${dbKey}${!checked ? "" : "?edit=true"}`);
  };
  const handleSave = async () => {
    const nowISO = formatISO(new Date());
    try {
      const title =
        pageData.slateData.find((node) => node.type === "heading-one")
          ?.children[0]?.text || "";

      await dispatch(
        patchData({
          dbKey,
          changes: { updated_at: nowISO, slateData: pageData.slateData, title },
        })
      ).unwrap();

      const spaceId = (pageData as any).spaceId;
      if (spaceId) {
        await dispatch(
          updateContentTitle({
            spaceId,
            contentKey: dbKey,
            title,
          })
        ).unwrap();
      }

      toast.success("保存成功");
      handleToggleEdit(false);
    } catch (error) {
      console.error(error);
      toast.error("保存失败");
    }
  };
  return (
    <>
      <div className="tools-container">
        <div className="title">{pageData.title}</div>

        <div className="controls">
          <div className="left-group">
            <DeleteButton dbKey={dbKey} />
            <div className="mode-switch">
              <ModeToggle isEdit={!isReadOnly} onChange={handleToggleEdit} />
            </div>
          </div>

          <div className="right-group">
            <Button
              variant="primary"
              icon={<CheckIcon size={16} />}
              onClick={handleSave}
              size="medium"
              disabled={isReadOnly}
              className={isReadOnly ? "hidden" : ""}
            >
              保存
            </Button>
          </div>
        </div>
      </div>

      <style>{`
        .tools-container {
          position: sticky;
          top: 0;
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 24px;
          background: ${theme.background};
          border-bottom: 1px solid ${theme.border};
          backdrop-filter: blur(8px);
        }

        .title {
          font-size: 16px;
          font-weight: 500;
          color: ${theme.textPrimary};
          margin-right: 24px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .controls {
          display: flex;
          align-items: center;
          gap: 24px;
          flex-shrink: 0;
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
        }

        .mode-switch:hover {
          background: ${theme.backgroundTertiary};
        }

        :global(.tools-container button) {
          transition: all 0.2s ease;
        }

        :global(.tools-container button:hover:not(:disabled)) {
          transform: translateY(-1px);
          box-shadow: 0 2px 4px ${theme.shadowLight};
        }

        :global(.tools-container .hidden) {
          opacity: 0;
          pointer-events: none;
        }

        @media (max-width: 640px) {
          .tools-container {
            padding: 8px 16px;
          }

          .title {
            display: none;
          }

          .controls {
            width: 100%;
            justify-content: space-between;
          }
        }
      `}</style>
    </>
  );
};
