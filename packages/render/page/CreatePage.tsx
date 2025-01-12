import { useAppDispatch, useAppSelector } from "app/hooks";
import { useAuth } from "auth/useAuth";
import { useTheme } from "app/theme";

// web imports
import { useNavigate } from "react-router-dom";
import Button from "web/ui/Button";
import Editor from "create/editor/Editor";

const CreatePage = () => {
  const theme = useTheme();

  const dispatch = useAppDispatch();
  const auth = useAuth();
  const pageState = useAppSelector((state) => state.page);
  const navigate = useNavigate();

  const handleSave = () => {
    console.log("test");
  };

  const save = async (pageData) => {
    try {
      const writePageAction = await dispatch(
        write({
          data: pageData,
        })
      );

      const result = writePageAction.payload;
      if (result) {
        const id = result.id;
        navigate(`/${id}?edit=true`);
      }
    } catch (error) {
      // 错误处理逻辑
    }
  };

  return (
    <>
      <style>
        {`
          .create-page {
            display: flex;
            min-height: 100vh;
            background-color: ${theme.background};
          }

          .main-content {
            flex: 1;
            display: flex;
            justify-content: center;
            padding: 24px;
          }

          .editor-wrapper {
            width: 100%;
            max-width: 1200px;
          }

          .editor-container {
            display: flex;
            flex-direction: column;
            gap: 16px;
          }

          .sidebar {
            width: 280px;
            padding: 24px;
            background-color: ${theme.backgroundSecondary};
            border-left: 1px solid ${theme.border};
            display: flex;
            flex-direction: column;
            gap: 24px;
          }


          .timestamp {
            color: ${theme.textSecondary};
            font-size: 14px;
          }


          @media (max-width: 768px) {
            .create-page {
              flex-direction: column;
            }
            
            .sidebar {
              width: 100%;
              border-left: none;
              border-top: 1px solid ${theme.border};
            }
          }
        `}
      </style>

      <div className="create-page">
        <div className="main-content">
          <div className="editor-wrapper">
            <div className="editor-container">
              <Editor initialValue={[]} />
            </div>
          </div>
        </div>

        <div className="sidebar">
          <Button onClick={handleSave}>Save</Button>
        </div>
      </div>
    </>
  );
};

export default CreatePage;
