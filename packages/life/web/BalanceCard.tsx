import { useTheme } from "app/theme";
const BalanceCard: React.FC = () => {
    const theme = useTheme();

    const cardStyle: React.CSSProperties = {
        background: theme.background,
        borderRadius: '12px',
        boxShadow: `0 2px 8px ${theme.shadowLight}`,
        padding: '24px',
        marginBottom: '24px'
    };

    return (
        <div style={cardStyle}>
            <h2 style={{
                fontSize: '1.25rem',
                fontWeight: 500,
                marginBottom: '0.5rem',
                textAlign: 'center',
                color: theme.text
            }}>
                当前余额
            </h2>
            <div style={{
                fontSize: '1.875rem',
                fontWeight: 700,
                color: theme.primary,
                marginBottom: '1rem',
                textAlign: 'center'
            }}>
                ¥ 1,280.00
            </div>
            <div style={{
                textAlign: 'center',
                color: theme.textSecondary,
                fontSize: '0.875rem'
            }}>
                如需充值请联系：
                <a
                    href="mailto:s@nolotus.com"
                    style={{
                        color: theme.primary,
                        textDecoration: 'none',
                        fontWeight: 500
                    }}
                    onMouseOver={(e) => {
                        e.currentTarget.style.textDecoration = 'underline';
                    }}
                    onMouseOut={(e) => {
                        e.currentTarget.style.textDecoration = 'none';
                    }}
                >
                    s@nolotus.com
                </a>
            </div>
        </div>
    );
};

export default BalanceCard;
