import React from "react";
import { useQueryData } from "app/hooks/useQueryData";
import { DataType } from "create/types";
import { useSelector } from "react-redux";
import { selectTheme } from "app/theme/themeSlice";
import { selectFilteredDataByUserAndType } from "database/selectors";
import { useAppSelector } from "app/hooks";
import CybotBlock from "./CybotBlock";
import { motion } from "framer-motion";
import { COLORS } from "render/styles/colors";

interface CybotsProps {
  queryUserId: string;
  limit?: number;
  closeModal?: () => void;
}

const Cybots: React.FC<CybotsProps> = ({
  queryUserId,
  limit = 20,
  closeModal,
}) => {
  const theme = useSelector(selectTheme);

  const queryConfig = {
    queryUserId,
    options: {
      isJSON: true,
      limit,
      condition: {
        type: DataType.Cybot,
      },
    },
  };

  const { isLoading, isSuccess } = useQueryData(queryConfig);

  const data = useAppSelector(
    selectFilteredDataByUserAndType(queryUserId, DataType.Cybot)
  );

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  if (isLoading) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "1.5rem",
          color: COLORS.textSecondary,
          fontSize: "1rem",
        }}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          加载 AI 列表中...
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        gap: "1.5rem",
        padding: "0.8rem",
        margin: "0 auto",
        maxWidth: "1200px",
      }}
    >
      {isSuccess &&
        data?.map((item) => (
          <motion.div key={item.id} variants={item}>
            <CybotBlock item={item} closeModal={closeModal} />
          </motion.div>
        ))}
    </motion.div>
  );
};

export default Cybots;
