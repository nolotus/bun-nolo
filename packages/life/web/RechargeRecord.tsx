// components/RechargeRecord.tsx
import { useTheme } from "app/theme";
import { ChevronDownIcon, ChevronUpIcon } from "@primer/octicons-react";
import { Table, TableRow, TableCell } from "web/ui/Table";

interface RechargeRecordProps {
  isVisible: boolean;
  onToggleVisibility: () => void;
}

const RechargeRecord: React.FC<RechargeRecordProps> = ({
  isVisible,
  onToggleVisibility,
}) => {
  const theme = useTheme();

  const records = [
    {
      id: 1,
      date: "2024-02-20 14:30",
      amount: 500.0,
      method: "信用卡",
      status: "成功",
    },
  ];

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="title">充值记录</h2>
        <button className="toggle-button" onClick={onToggleVisibility}>
          {isVisible ? (
            <>
              <span>收起</span>
              <ChevronUpIcon size={16} />
            </>
          ) : (
            <>
              <span>展开</span>
              <ChevronDownIcon size={16} />
            </>
          )}
        </button>
      </div>

      {isVisible && (
        <Table>
          <thead>
            <TableRow>
              <TableCell element={{ header: true }}>充值时间</TableCell>
              <TableCell element={{ header: true }}>充值金额</TableCell>
              <TableCell element={{ header: true }}>支付方式</TableCell>
              <TableCell element={{ header: true }}>交易状态</TableCell>
            </TableRow>
          </thead>
          <tbody>
            {records.map((record) => (
              <TableRow key={record.id}>
                <TableCell element={{}}>{record.date}</TableCell>
                <TableCell element={{}}>¥ {record.amount.toFixed(2)}</TableCell>
                <TableCell element={{}}>{record.method}</TableCell>
                <TableCell element={{}}>
                  <span className="status-badge">{record.status}</span>
                </TableCell>
              </TableRow>
            ))}
          </tbody>
        </Table>
      )}

      <style jsx>{`
        .card {
          background: ${theme.background};
          border-radius: 12px;
          box-shadow: 0 2px 8px ${theme.shadowLight};
          padding: 24px;
          margin-bottom: 24px;
          transition: box-shadow 0.2s ease;
        }

        .card:hover {
          box-shadow: 0 4px 12px ${theme.shadowMedium};
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .title {
          font-size: 1.25rem;
          font-weight: 500;
          color: ${theme.text};
          margin: 0;
        }

        .toggle-button {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          font-size: 0.875rem;
          font-weight: 500;
          color: ${theme.primary};
          background: transparent;
          border: 1px solid ${theme.border};
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .toggle-button:hover {
          background: ${theme.backgroundSecondary};
          border-color: ${theme.borderHover};
        }

        @media (max-width: 640px) {
          .card {
            padding: 16px;
          }

          .toggle-button {
            padding: 0.375rem 0.75rem;
          }
        }
      `}</style>
    </div>
  );
};

export default RechargeRecord;
