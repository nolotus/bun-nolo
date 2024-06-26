import React, { useCallback, useState } from "react";
import { copyToClipboard } from "utils/clipboard";
import clsx from "clsx";
import OpenProps from "open-props";
import { CheckIcon, CopyIcon } from "@primer/octicons-react";

const CopyToClipboard = ({ text }) => {
  const [isCopied, setIsCopied] = useState(false);

  const copyText = useCallback(async () => {
    try {
      await copyToClipboard(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000); // 复制状态持续2秒
    } catch (err) {
      console.error("无法复制:", err);
    }
  }, [text]);

  return (
    <button
      onClick={copyText}
      className={clsx("border-0 bg-transparent px-3 py-1")}
      style={{
        boxShadow: OpenProps.shadow1,
        color: isCopied && OpenProps.green7,
      }}
      disabled={!text}
      aria-label="复制代码"
    >
      {isCopied ? <CheckIcon /> : <CopyIcon />}
    </button>
  );
};
export default CopyToClipboard;
