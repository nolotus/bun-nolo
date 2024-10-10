import { useAuth } from "auth/useAuth";
import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const YourTemplates = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<any[]>([]);
  const auth = useAuth();
  const handleButtonClick = (template) => {
    navigate("/create/block", { state: { dsl: template } });
  };
  const options = useMemo(() => {
    return {
      isObject: true,
      condition: {
        type: "blockTemplate",
      },
    };
  }, []);

  useEffect(() => {
    // queryData(auth.user?.userId, options)
    //   .then((data) => {
    //     setTemplates(data);
    //   })
    //   .catch((error) => {
    //   });
  }, [auth.user?.userId, options]);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">你自己的模板</h2>
      <div className="flex flex-wrap space-x-4">
        {templates.map((template, index) => (
          <button
            key={index}
            onClick={() => handleButtonClick(template)}
            className="bg-yellow-500 text-white"
          >
            {template.name}
          </button>
        ))}
      </div>
    </div>
  );
};
