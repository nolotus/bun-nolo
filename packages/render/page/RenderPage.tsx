import { useMemo } from "react";
import { extractUserId } from "core/prefix";

import Editor from "create/editor/Editor";
import { markdownToSlate } from "create/editor/markdownToSlate";

const RenderPage = ({ pageId, data }) => {
  const createId = extractUserId(pageId);

  const initialValue = useMemo(() => {
    return data.slateData ? data.slateData : markdownToSlate(data.content);
  }, [data.slateData, data.content]);

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
          padding: "10px",
          borderBottom: "1px solid #eee",
        }}
      >
        <div style={{ fontSize: "16px", color: "#666" }}>{createId}</div>
      </div>
      <Editor
        initialValue={initialValue}
        readOnly={true}
        style={{ minHeight: "300px" }}
      />
    </div>
  );
};

export default RenderPage;
