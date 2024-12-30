// web/form/FormContainer.tsx
import { useTheme } from "app/theme";

const FormContainer = ({ children }) => {
    const theme = useTheme();

    return (
        <div style={{
            maxWidth: 600,
            margin: "0 auto",
            padding: 20,
            color: theme.text
        }}>
            {children}
        </div>
    );
};
export default FormContainer;