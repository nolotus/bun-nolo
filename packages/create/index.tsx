import { nolotusId } from "core/init";
import React, { useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryData } from "app/hooks";
import { Button } from "render/ui/Button";

import { YourTemplates } from "./YourTemplates";
import { CreateRoutePaths } from "./routes";

const ButtonGroup = ({ buttons, onButtonClick }) => (
  <div className="flex flex-wrap space-x-4">
    {buttons.map((button) => (
      <Button key={button.text} onClick={() => onButtonClick(button.route)}>
        {button.text}
      </Button>
    ))}
  </div>
);

const Create = () => {
  const navigate = useNavigate();

  const buttonsInfo = useMemo(
    () => [
      { text: "Cybot", route: `/${CreateRoutePaths.CREATE_CYBOT}` },
      { text: "大语言模型", route: `/${CreateRoutePaths.CREATE_LLM}` },
      { text: "空白页面", route: `/${CreateRoutePaths.CREATE_PAGE}` },
      { text: "提示词", route: `/${CreateRoutePaths.CREATE_PROMPT}` },
    ],
    [],
  );

  const options = useMemo(
    () => ({
      isJSON: true,
      condition: { is_template: true },
      limit: 20,
    }),
    [],
  );

  const queryConfig = useMemo(
    () => ({
      queryUserId: nolotusId,
      options,
    }),
    [options],
  );

  const { data: templates, isLoading, error } = useQueryData(queryConfig);

  const handleButtonClick = useCallback(
    (route) => {
      navigate(route);
    },
    [navigate],
  );

  const templateButtons = useMemo(
    () =>
      templates?.map((template) => ({
        text: template.title,
        route: `/create/page?id=${template.id}`,
      })) ?? [],
    [templates],
  );

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="container mx-auto space-y-8">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">从公共模板创建</h2>
        <ButtonGroup buttons={buttonsInfo} onButtonClick={handleButtonClick} />
        <ButtonGroup
          buttons={templateButtons}
          onButtonClick={handleButtonClick}
        />
      </div>
      <YourTemplates />
    </div>
  );
};

export default Create;
