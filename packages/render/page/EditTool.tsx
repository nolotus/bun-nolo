import { NavLink, useNavigate, useParams } from "react-router-dom";
import React, { useCallback, useState } from "react";
import { Button } from "render/ui";
import { useAppSelector, useAppDispatch } from "app/hooks";
import { deleteData } from "database/dbSlice";
import OpenProps from "open-props";
import toast from "react-hot-toast";
import ToggleSwitch from "render/ui/ToggleSwitch";

import {
  setHasVersion,
  saveContentAndMdast,
  setShowAsMarkdown,
  updateContent,
  setSaveAsTemplate,
} from "./pageSlice";
export const EditTool = ({ handleSave }) => {
  const { pageId } = useParams();
  const navigate = useNavigate();

  const pageState = useAppSelector((state) => state.page);
  const dispatch = useAppDispatch();
  const [isDeleting, setDeleting] = useState(false);

  const toggleShowAsMarkdown = (value) => {
    dispatch(setShowAsMarkdown(value));
  };
  const handleToggleTemplateChange = (value: boolean) => {
    dispatch(setSaveAsTemplate(value));
  };
  const saveAsTemplate = useAppSelector((state) => state.page.saveAsTemplate);

  const handleDelete = useCallback(async () => {
    setDeleting(true);
    try {
      dispatch(deleteData({ id: pageId }));
      toast.success("Page deleted successfully!");
      navigate("/life/notes");
      setDeleting(false);
    } catch (error) {
      toast.error("Error deleting page. Please try again.");
    }
  }, [navigate, pageId]);

  return (
    <div>
      {/* <div className="text-gray-600">
        {pageState.createdTime} |{" "}
        {pageState.hasVersion ? "Versioned" : "Not Versioned"}
      </div> */}
      <div
        style={{
          display: "flex",
          gap: OpenProps.sizeFluid1,
          alignItems: "center",
        }}
      >
        <span>按Markdown编辑</span>
        <ToggleSwitch
          aria-labelledby="toggle"
          defaultChecked={pageState.showAsMarkdown}
          onChange={toggleShowAsMarkdown}
        />
      </div>
      <div
        style={{
          display: "flex",
          gap: OpenProps.sizeFluid1,
          alignItems: "center",
        }}
      >
        <span>按模板保存</span>
        <ToggleSwitch
          defaultChecked={saveAsTemplate}
          onChange={handleToggleTemplateChange}
        />
      </div>

      <Button onClick={handleSave}>保存</Button>
      <div>
        <NavLink to={`/${pageId}`}>预览</NavLink>
      </div>
      <div>
        <button
          type="button"
          onClick={handleDelete}
          disabled={isDeleting}
          className={`rounded bg-red-500 px-4 py-2 font-bold text-white hover:bg-red-700 ${
            isDeleting ? "cursor-not-allowed opacity-50" : ""
          }`}
        >
          {isDeleting ? "Deleting..." : "Delete"}
        </button>
      </div>
    </div>
  );
};
