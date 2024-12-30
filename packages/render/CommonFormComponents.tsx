import type React from "react";
import type { ReactNode } from "react";
import { useTheme } from "app/theme";
const useCommonFormStyles = () => {
  const theme = useTheme();
  return {
    errorMessage: {
      color: theme.error,
      fontSize: "0.8em",
    },
  };
};

export const ErrorMessage: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const styles = useCommonFormStyles();
  return <span style={styles.errorMessage}>{children}</span>;
};



