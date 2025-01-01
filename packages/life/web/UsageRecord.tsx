// components/UsageRecord.tsx
import React from 'react';
import { useTheme } from "app/theme";

interface UsageRecordProps {
    // 可以根据需要添加props
}

const UsageRecord: React.FC<UsageRecordProps> = () => {
    const theme = useTheme();

    const styles = {
        card: {
            background: theme.background,
            borderRadius: '12px',
            boxShadow: `0 2px 8px ${theme.shadowLight}`,
            padding: '24px',
            marginBottom: '24px'
        },
        button: {
            background: theme.primary,
            color: theme.text,
            padding: '8px 16px',
            borderRadius: '6px',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.2s'
        },
        table: {
            width: '100%',
            borderCollapse: 'collapse'
        },
        tableHeader: {
            backgroundColor: theme.backgroundSecondary,
            borderBottom: `1px solid ${theme.border}`
        },
        tableRow: {
            borderBottom: `1px solid ${theme.border}`
        },
        input: {
            padding: '8px',
            border: `1px solid ${theme.border}`,
            borderRadius: '6px',
            color: theme.text,
            background: theme.background
        }
    };

    return (
        <div style={styles.card}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1rem'
            }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 500, color: theme.text }}>使用记录</h2>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <input
                        type="date"
                        style={styles.input}
                    />
                    <select style={styles.input}>
                        <option>全部模型</option>
                        <option>GPT-3.5</option>
                        <option>GPT-4</option>
                    </select>
                </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
                <table style={styles.table}>
                    <thead>
                        <tr style={styles.tableHeader}>
                            <th style={{ padding: '12px', textAlign: 'left', color: theme.textSecondary }}>创建时间</th>
                            <th style={{ padding: '12px', textAlign: 'left', color: theme.textSecondary }}>使用名称</th>
                            <th style={{ padding: '12px', textAlign: 'left', color: theme.textSecondary }}>Token用量</th>
                            <th style={{ padding: '12px', textAlign: 'left', color: theme.textSecondary }}>模型</th>
                            <th style={{ padding: '12px', textAlign: 'left', color: theme.textSecondary }}>统计截至时间</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr style={styles.tableRow}>
                            <td style={{ padding: '12px', color: theme.text }}>2024-02-20 14:30</td>
                            <td style={{ padding: '12px', color: theme.text }}>项目方案讨论</td>
                            <td style={{ padding: '12px', color: theme.text }}>1,234</td>
                            <td style={{ padding: '12px', color: theme.text }}>GPT-4</td>
                            <td style={{ padding: '12px', color: theme.text }}>2024-02-21 14:30</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '1rem'
            }}>
                <span style={{ color: theme.textSecondary }}>共 24 条记录</span>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button style={{ ...styles.button, background: theme.backgroundSecondary, color: theme.textSecondary }}>上一页</button>
                    <button style={styles.button}>1</button>
                    <button style={{ ...styles.button, background: theme.backgroundSecondary, color: theme.textSecondary }}>2</button>
                    <button style={{ ...styles.button, background: theme.backgroundSecondary, color: theme.textSecondary }}>3</button>
                    <button style={{ ...styles.button, background: theme.backgroundSecondary, color: theme.textSecondary }}>下一页</button>
                </div>
            </div>
        </div>
    );
};

export default UsageRecord;
