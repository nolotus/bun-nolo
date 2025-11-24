// life/web/RechargeModal.tsx
import React, { useState } from "react";
import Button from "render/web/ui/Button";
import { BaseActionModal } from "render/web/ui/modal/BaseActionModal";

import { CreditCardIcon } from "@primer/octicons-react";
import { useTheme } from "app/theme";

interface RechargeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (amount: number) => Promise<void>;
  username?: string;
  loading?: boolean;
}

export const RechargeModal: React.FC<RechargeModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  username,
  loading: externalLoading,
}) => {
  const theme = useTheme();
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Reset state when modal closes
  React.useEffect(() => {
    if (!isOpen) {
      setAmount("");
      setError("");
      setLoading(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = Number(amount);

    if (!amount || isNaN(value)) {
      setError("请输入有效金额");
      return;
    }

    if (value <= 0) {
      setError("充值金额必须大于0");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await onConfirm(value);
      onClose();
    } catch (err) {
      setError("充值失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseActionModal
      isOpen={isOpen}
      onClose={onClose}
      title="用户充值"
      titleIcon={<CreditCardIcon size={16} />}
      status="info"
      width={440}
      actions={
        <>
          <Button
            onClick={onClose}
            variant="secondary"
            size="small"
            disabled={loading || externalLoading}
          >
            取消
          </Button>
          <Button
            type="submit"
            form="recharge-form"
            variant="primary"
            size="small"
            loading={loading || externalLoading}
          >
            确认充值
          </Button>
        </>
      }
    >
      <form
        id="recharge-form"
        onSubmit={handleSubmit}
        className="recharge-form"
      >
        {username && (
          <div className="form-info">
            正在为用户 <span className="username">{username}</span> 充值
          </div>
        )}

        <div className="form-group">
          <label htmlFor="amount" className="form-label">
            充值金额
          </label>
          <div className="input-wrapper">
            <span className="currency-symbol">¥</span>
            <input
              id="amount"
              className="amount-input"
              type="number"
              min="0.01"
              step="0.01"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                setError("");
              }}
              placeholder="请输入充值金额"
              disabled={loading || externalLoading}
            />
          </div>
          {error && <div className="error-message">{error}</div>}
        </div>
      </form>

      <style jsx>{`
        .recharge-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .form-info {
          color: ${theme.textSecondary};
          font-size: 14px;
          padding: 8px 12px;
          background: ${theme.backgroundSecondary};
          border-radius: 6px;
        }

        .username {
          color: ${theme.text};
          font-weight: 500;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-label {
          color: ${theme.textSecondary};
          font-size: 14px;
        }

        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .currency-symbol {
          position: absolute;
          left: 12px;
          color: ${theme.textSecondary};
          font-size: 14px;
          pointer-events: none;
        }

        .amount-input {
          flex: 1;
          padding: 8px 12px 8px 28px;
          border: 1px solid ${theme.border};
          border-radius: 6px;
          background: ${theme.backgroundSecondary};
          color: ${theme.text};
          font-size: 14px;
          width: 100%;
          transition: border-color 0.2s;
        }

        .amount-input:focus {
          outline: none;
          border-color: ${theme.primary};
        }

        .amount-input:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .error-message {
          color: ${theme.error};
          font-size: 14px;
        }

        @media (max-width: 640px) {
          .form-info {
            margin: -8px -12px 0;
            border-radius: 0;
          }
        }
      `}</style>
    </BaseActionModal>
  );
};
