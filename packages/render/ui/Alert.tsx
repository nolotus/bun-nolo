import React, { useState } from 'react';
import { useTranslation } from "react-i18next";
import { defaultTheme } from "render/styles/colors";
import { BaseModal } from './BaseModal';
import { Button } from './Button';
import {
  XCircleIcon,  // 错误/关闭
  AlertIcon,    // 警告
  CheckCircleIcon, // 成功
  InfoIcon      // 信息
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


  const getIcon = () => {
    switch (type) {
      case 'error':
        return <XCircleIcon size={24} />;
      case 'warning':
        return <AlertIcon size={24} />;
      case 'success':
        return <CheckCircleIcon size={24} />;
      default:
        return <InfoIcon size={24} />;
    }
  };


  return (
    <BaseModal isOpen={isOpen} onClose={onClose} className="alert-modal">
      <div className="alert-container">
        <div className="alert-icon">
          {getIcon()}
        </div>
        <h2 className="alert-title">{title}</h2>
        <p className="alert-message">{message}</p>
        <div className="alert-buttons">
          {showCancel && (
            <Button
              variant="secondary"
              onClick={onClose}
              disabled={loading}
            >
              {cancelText || t("cancel")}
            </Button>
          )}
          <Button
            variant="primary"
            status={type === 'error' || type === 'warning' ? 'error' : undefined}
            onClick={onConfirm}
            loading={loading}
            disabled={loading}
          >
            {confirmText || t("confirm")}
          </Button>
        </div>
      </div>


      <style herf='alert' >{`
        .alert-container {
          background: ${defaultTheme.backgroundSecondary};
          padding: 2.5rem;
          border-radius: 12px;
          min-width: 320px;
          max-width: 90%;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 1.5rem;
        }


        .alert-icon {
          color: ${type === 'error' ? defaultTheme.error :
          type === 'warning' ? defaultTheme.warning :
            type === 'success' ? defaultTheme.success :
              defaultTheme.primary};
        }


        .alert-title {
          font-size: 24px;
          font-weight: 600;
          color: ${defaultTheme.text};
          margin: 0;
          line-height: 1.3;
        }


        .alert-message {
          color: ${defaultTheme.textSecondary};
          font-size: 15px;
          line-height: 1.6;
          margin: 0;
          max-width: 85%;
        }


        .alert-buttons {
          display: flex;
          gap: 12px;
          justify-content: center;
          width: 100%;
        }


        @media (max-width: 640px) {
          .alert-container {
            padding: 2rem;
            min-width: 280px;
          }


          .alert-title {
            font-size: 22px;
          }


          .alert-message {
            font-size: 14px;
            max-width: 95%;
          }
        }
      `}</style>
    </BaseModal>
  );
};


export interface UseAlertReturn<T> {
  visible: boolean;
  openAlert: (item: T) => void;
  closeAlert: () => void;
  doDelete: () => void;
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
    setVisible(false);
    setModalState(null);
    setLoading(false);
  };


  const doDelete = async () => {
    if (modalState) {
      try {
        setLoading(true);
        await deleteCallback(modalState);
        closeAlert();
      } finally {
        setLoading(false);
      }
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


export default Alert;


