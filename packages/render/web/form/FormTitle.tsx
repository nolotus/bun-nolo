// web/form/FormTitle.tsx
import type { ReactNode } from "react";
import { useTheme } from "app/theme";

interface FormTitleProps {
  children: ReactNode;
  fontSize?: string;
  marginBottom?: string;
}

export const FormTitle: React.FC<FormTitleProps> = ({
  children,
  fontSize = "1.5rem",
  marginBottom = "1.5rem",
}) => {
  const theme = useTheme();

  const styles = {
    title: {
      fontSize,
      fontWeight: 600,
      color: theme.text,
      textAlign: "center" as const,
      margin: `0 0 ${marginBottom} 0`,
      padding: 0,
      lineHeight: 1.4,
    },
  };

  return <h2 style={styles.title}>{children}</h2>;
};

export default FormTitle;
