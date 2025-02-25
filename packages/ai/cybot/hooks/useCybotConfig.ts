import { useEffect, useState } from "react";

import { useAppSelector, useAppDispatch } from "app/hooks";
import { read } from "database/dbSlice";

import { selectCurrentDialogConfig } from "chat/dialog/dialogSlice";

const useCybotConfig = () => {
  const dispatch = useAppDispatch();
  const [cybotConfig, setCybotConfig] = useState(null);

  const currentDialogConfig = useAppSelector(selectCurrentDialogConfig);

  useEffect(() => {
    const fetchCybotConfig = async () => {
      const cybotId = currentDialogConfig.cybots
        ? currentDialogConfig.cybots[0]
        : currentDialogConfig.llmId;

      const result = await dispatch(read(cybotId)).unwrap();
      setCybotConfig(result);
    };

    fetchCybotConfig();
  }, [currentDialogConfig, dispatch]);

  return cybotConfig;
};

export default useCybotConfig;
