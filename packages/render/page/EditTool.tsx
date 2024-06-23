import { NavLink, useNavigate, useParams } from "react-router-dom";
import React, { useCallback, useState } from "react";
import { Button } from "render/ui";

import { useAppSelector, useAppDispatch } from "app/hooks";
import { removeOne } from "database/dbSlice";

import { Text } from "@primer/react";
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
      // await deleteEntry({ entryId: pageId }).unwrap();
      dispatch(removeOne(pageId));

      // addToast('Page deleted successfully!');
      navigate("/life/notes");
      setDeleting(false);
    } catch (error) {
      console.error("Failed to delete the page:", error);
      //   addToast("Error deleting page. Please try again.");
    }
  }, [navigate, pageId]);

  return (
    <div className="flex items-center justify-between bg-gray-100 p-4">
      {/* <div className="text-gray-600">
        {pageState.createdTime} |{" "}
        {pageState.hasVersion ? "Versioned" : "Not Versioned"}
      </div> */}
      <Text id="markdown-toggle" fontWeight="bold" fontSize={1}>
        按Markdown编辑
      </Text>
      <ToggleSwitch
        aria-labelledby="toggle"
        defaultChecked={pageState.showAsMarkdown}
        onChange={toggleShowAsMarkdown}
      />

      <Text id="markdown-toggle" fontWeight="bold" fontSize={1}>
        按模板保存
      </Text>
      <ToggleSwitch
        aria-labelledby="toggle"
        defaultChecked={saveAsTemplate}
        onChange={handleToggleTemplateChange}
      />

      <Button onClick={handleSave} variant="primary" size="medium">
        保存
      </Button>
      <NavLink to={`/${pageId}`}>预览</NavLink>
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
  );
};
