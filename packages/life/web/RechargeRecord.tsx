// components/RechargeRecord.tsx
import React from 'react';

interface RechargeRecordProps {
    isVisible: boolean;
    onToggleVisibility: () => void;
}

const RechargeRecord: React.FC<RechargeRecordProps> = ({ isVisible, onToggleVisibility }) => {
    const cardStyle: React.CSSProperties = {
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        padding: '24px',
        marginBottom: '24px'
    };

    const btnPrimaryStyle: React.CSSProperties = {
        background: '#1a73e8',
        color: 'white',
        padding: '8px 16px',
        borderRadius: '6px',
        border: 'none',
        cursor: 'pointer',
        transition: 'all 0.2s'
    };

    const tableStyle: React.CSSProperties = {
        width: '100%',
        borderCollapse: 'collapse'
    };

    const tableHeaderStyle: React.CSSProperties = {
        backgroundColor: '#f9fafb',
        borderBottom: '1px solid #eee'
    };

    const tableRowStyle: React.CSSProperties = {
        borderBottom: '1px solid #eee'
    };

    return (
        <div style={cardStyle}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1rem'
            }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 500 }}>充值记录</h2>
                <button
                    className="btn-primary"
                    style={btnPrimaryStyle}
                    onClick={onToggleVisibility}
                >
                    {isVisible ? '折叠' : '展开'}
                </button>
            </div>

            {isVisible && (
                <div style={{ overflowX: 'auto' }}>
                    <table style={tableStyle}>
                        <thead>
                            <tr style={tableHeaderStyle}>
                                <th style={{ padding: '12px', textAlign: 'left' }}>充值时间</th>
                                <th style={{ padding: '12px', textAlign: 'left' }}>充值金额</th>
                                <th style={{ padding: '12px', textAlign: 'left' }}>支付方式</th>
                                <th style={{ padding: '12px', textAlign: 'left' }}>交易状态</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr style={tableRowStyle}>
                                <td style={{ padding: '12px' }}>2024-02-20 14:30</td>
                                <td style={{ padding: '12px' }}>¥500.00</td>
                                <td style={{ padding: '12px' }}>信用卡</td>
                                <td style={{ padding: '12px', color: 'green' }}>成功</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default RechargeRecord;
