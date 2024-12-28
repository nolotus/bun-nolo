import React from 'react';
import { useTranslation } from "react-i18next";
import { defaultTheme } from "render/styles/colors";
import { BaseModal } from './BaseModal';
import { Button } from 'render/ui/Button';
import { animations } from '../styles/animations';
import {
  XCircleIcon,
  AlertIcon,
  CheckCircleIcon,
  InfoIcon,
} from '@primer/octicons-react';

interface AlertProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  type?: "info" | "warning" | "error" | "success";
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
  loading?: boolean;
}

export const Alert: React.FC<AlertProps> = ({
  isOpen,
  onClose,
  onConfirm,
  message,
  title,
  type = "info",
  confirmText,
  cancelText,
  showCancel = true,
  loading = false,
}) => {
  const { t } = useTranslation();

  const getIconConfig = () => {
    const configs = {
      error: { Icon: XCircleIcon, color: defaultTheme.error },
      warning: { Icon: AlertIcon, color: defaultTheme.warning },
      success: { Icon: CheckCircleIcon, color: defaultTheme.success },
      info: { Icon: InfoIcon, color: defaultTheme.primary }
    };
    return configs[type];
  };

  const { Icon, color } = getIconConfig();

  return (
    <BaseModal isOpen={isOpen} onClose={onClose}>
      <div className="alert-container">
        <div className="alert-icon">
          <Icon size={28} />
        </div>

        <div className="alert-content">
          <h2 className="alert-title">{title}</h2>
          <p className="alert-message">{message}</p>
        </div>

        <div className="alert-buttons">
          {showCancel && (
            <Button
              variant="secondary"
              onClick={onClose}
              disabled={loading}
              size="medium"
            >
              {cancelText || t("cancel")}
            </Button>
          )}
          <Button
            variant="primary"
            status={type === 'error' ? 'error' : undefined}
            onClick={onConfirm}
            loading={loading}
            disabled={loading}
            size="medium"
          >
            {confirmText || t("confirm")}
          </Button>
        </div>
      </div>

      <style jsx>{`
        .alert-container {
          background: ${defaultTheme.backgroundSecondary};
          padding: 28px;
          border-radius: 16px;
          width: 400px;
          max-width: calc(100vw - 32px);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
          animation: ${animations.fadeIn} ${animations.duration.normal} ${animations.easing};
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
        }

        .alert-icon {
          color: ${color};
          height: 48px;
          width: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: ${color}10;
          border-radius: 50%;
          transition: transform ${animations.duration.fast} ${animations.spring};
        }

        .alert-container:hover .alert-icon {
          transform: scale(1.05);
        }

        .alert-content {
          text-align: center;
        }

        .alert-title {
          font-size: 18px;
          font-weight: 600;
          color: ${defaultTheme.text};
          margin: 0;
          line-height: 1.4;
        }

        .alert-message {
          color: ${defaultTheme.textSecondary};
          font-size: 14px;
          line-height: 1.6;
          margin: 8px 0 0;
          max-width: 320px;
        }

        .alert-buttons {
          display: flex;
          gap: 12px;
          justify-content: center;
          width: 100%;
          margin-top: 4px;
        }

        @media (max-width: 640px) {
          .alert-container {
            padding: 24px;
            width: 100%;
          }

          .alert-message {
            max-width: 100%;
          }
        }
      `}</style>
    </BaseModal>
  );
};
import { useState } from 'react';

export interface UseAlertReturn<T> {
  visible: boolean;
  openAlert: (item: T) => void;
  closeAlert: () => void;
  doDelete: () => Promise<void>;
  modalState: T | null;
  loading: boolean;
}

export function useDeleteAlert<T = any>(
  deleteCallback: (item: T) => void | Promise<void>
): UseAlertReturn<T> {
  const [visible, setVisible] = useState(false);
  const [modalState, setModalState] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);

  const openAlert = (item: T) => {
    setModalState(item);
    setVisible(true);
  };

  const closeAlert = () => {
    // 如果正在加载，不允许关闭
    if (loading) return;

    setVisible(false);
    // 使用 setTimeout 确保关闭动画完成后再重置状态
    setTimeout(() => {
      setModalState(null);
      setLoading(false);
    }, 200);
  };

  const doDelete = async () => {
    if (!modalState) return;

    try {
      setLoading(true);
      await Promise.resolve(deleteCallback(modalState));
      closeAlert();
    } catch (error) {
      console.error('Delete operation failed:', error);
      setLoading(false);
    }
  };

  return {
    visible,
    openAlert,
    closeAlert,
    doDelete,
    modalState,
    loading,
  };
}

