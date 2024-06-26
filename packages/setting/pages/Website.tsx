import React from "react";
import OpenProps from "open-props";
import { useAppDispatch } from "app/hooks";
import { write } from "database/dbSlice";

const Website = () => {
  const disptch = useAppDispatch();
  const saveConfig = () => {
    disptch(write());
    console.log("xxx");
  };
  return (
    <div style={{ gap: OpenProps.sizeFluid2, marginTop: OpenProps.size3 }}>
      <div>
        网站域名
        <input></input>
        <button onClick={saveConfig}>保存</button>
      </div>

      <div>分类</div>
    </div>
  );
};
export default Website;
