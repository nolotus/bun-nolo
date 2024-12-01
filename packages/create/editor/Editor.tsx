import React, { useEffect } from "react";
import { createEditor } from "slate";
import { Slate, Editable, withReact } from "slate-react";
import { renderElement } from "render/renderElements";
import { renderLeaf } from "./renderLeafs";
import { markdownToSlate } from "./markdownToSlate";
import { useAppSelector } from "app/hooks";
import { selectTheme } from "app/theme/themeSlice";
import { withHistory } from "slate-history";

const VALID_VALUE = [
  {
    type: "paragraph",
    children: [{ text: "" }],
  },
];

interface EditorProps {
  slateData?: any; // slate格式的数据
  markdown?: string; // markdown字符串
  isEdit?: boolean;
}

const Editor: React.FC<EditorProps> = ({ slateData, markdown, isEdit }) => {
  const editor = withReact(withHistory(createEditor()));

  useEffect(() => {
    try {
      if (slateData) {
        // 优先使用 slateData
        editor.children =
          Array.isArray(slateData) && slateData.length > 0
            ? slateData
            : VALID_VALUE;
      } else if (markdown) {
        // 其次使用 markdown
        const nodes = markdownToSlate(markdown);
        editor.children =
          Array.isArray(nodes) && nodes.length > 0 ? nodes : VALID_VALUE;
      } else {
        editor.children = VALID_VALUE;
      }
      editor.onChange();
    } catch (error) {
      console.error("Error parsing content:", error);
      editor.children = VALID_VALUE;
      editor.onChange();
    }
  }, [slateData, markdown, editor]);

  const isDarkMode = useAppSelector((state) => state.theme.isDarkMode);
  const theme = useAppSelector(selectTheme);

  return (
    <Slate
      editor={editor}
      initialValue={VALID_VALUE}
      onChange={(value) => {
        console.log("value", value);
        const isAstChange = editor.operations.some(
          (op) => "set_selection" !== op.type,
        );
        if (isAstChange) {
          console.log("save", value);

          // Save the value to Local Storage.
          // const content = JSON.stringify(value);
          // localStorage.setItem("content", content);
        }
      }}
    >
      <Editable
        readOnly={!isEdit}
        renderElement={(props) =>
          renderElement({
            ...props,
            isDarkMode,
            theme,
          })
        }
        renderLeaf={renderLeaf}
      />
    </Slate>
  );
};

export default Editor;
