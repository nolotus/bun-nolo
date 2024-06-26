import { DatabaseIcon } from "@primer/octicons-react";
import { parse } from "yaml";
import OpenProps from "open-props";
import CopyToClipboard from "./CopyToClipboard";
import { useAppDispatch } from "app/hooks";
import { write } from "database/dbSlice";

const CodeHeader = ({ value, language }) => {
  const dispath = useAppDispatch();
  const format = language?.toUpperCase();
  const saveToDataBase = () => {
    const json = parse(value);
    dispath(write(json));
    console.log("saveToDataBase", json);
  };
  return (
    <div
      className="surface3 flex items-center  justify-between px-4 py-2"
      style={{
        borderTopLeftRadius: OpenProps.radius2,
        borderTopRightRadius: OpenProps.radius2,
      }}
    >
      <span>{format || "CODE"}</span>
      <div className="flex items-center">
        {format === "YAML" && (
          <div style={{}} onClick={saveToDataBase}>
            <DatabaseIcon size={24} />
          </div>
        )}
        {/* <button
            onClick={togglePreview} // 切换预览状态
            aria-label="切换预览"
            className="surface3 mr-2 border-0 px-3 py-1"
            style={{ boxShadow: Shadows["--shadow-1"] }}
          >
            {isPreview ? <EyeClosedIcon /> : <EyeIcon />}
          </button> */}

        <CopyToClipboard text={value} />
      </div>
    </div>
  );
};
export default CodeHeader;
