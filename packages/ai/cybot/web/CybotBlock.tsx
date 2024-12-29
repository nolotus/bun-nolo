import debounce from "lodash/debounce";
import type React from "react";
import { useDispatch } from "react-redux";
import { useCallback, useState } from "react";

import { selectTheme } from "app/theme/themeSlice";
import withTranslations from "i18n/withTranslations";
import { useTranslation } from "react-i18next";
import { animations } from "render/styles/animations";
import { useAppSelector } from "app/hooks";

import { useCouldEdit } from "auth/useCouldEdit";
import { useCreateDialog } from "chat/dialog/useCreateDialog";
import { deleteData } from "database/dbSlice";
import { useModal } from "render/ui/Modal";

import toast from "react-hot-toast";
import Button from "web/ui/Button";
import { IconHoverButton } from "render/ui/IconHoverButton";
import { Dialog } from "render/ui/Dialog";
import { CommentDiscussionIcon, PencilIcon, TrashIcon } from '@primer/octicons-react';

import EditCybot from "ai/cybot/EditCybot";

interface CybotBlockProps {
	item: {
		id: string;
		name?: string;
		model: string;
		introduction?: string;
		provider: string;
	};
	closeModal?: () => void;
}

const CybotBlock = ({ item, closeModal }: CybotBlockProps) => {
	const { t } = useTranslation();
	const theme = useAppSelector(selectTheme);
	const { isLoading, createNewDialog } = useCreateDialog();
	const { visible: editVisible, open: openEdit, close: closeEdit } = useModal();
	const dispatch = useDispatch();
	const [deleting, setDeleting] = useState(false);
	const allowEdit = useCouldEdit(item.id);

	const startDialog = async () => {
		if (isLoading) return;
		try {
			await createNewDialog({ cybots: [item.id] });
			closeModal?.();
		} catch (error) {
			toast.error(t("createDialogError"));
		}
	};

	const handleDelete = useCallback(
		debounce(async () => {
			if (deleting) return;
			setDeleting(true);
			try {
				await dispatch(deleteData({ id: item.id }));
				toast.success(t("deleteSuccess"));
			} catch (error) {
				toast.error(t("deleteError"));
			} finally {
				setDeleting(false);
			}
		}, 300),
		[dispatch, item.id, t, deleting],
	);

	const handleEdit = (e: React.MouseEvent) => {
		e.stopPropagation();
		openEdit();
	};

	return (
		<>
			<div className="cybot-block">
				<div className="header">
					<div className="avatar" role="img" aria-label={item.name || t("unnamed")}>
						{item.name?.[0]?.toUpperCase() || "?"}
					</div>

					<div className="info">
						<h3 className="title">
							{item.name || t("unnamed")}
						</h3>
						<div className="tags">
							<div className="tag model-tag">
								{item.model}
							</div>
							<div className="tag provider-tag">
								{item.provider}
							</div>
						</div>
					</div>
				</div>

				<div className="description">
					{item.introduction || t("noDescription")}
				</div>

				<div className="actions">
					<Button
						icon={<CommentDiscussionIcon size={16} />}
						onClick={startDialog}
						disabled={isLoading}
						loading={isLoading}
						size="medium"
						style={{ flex: 2 }}
					>
						{isLoading ? t("starting") : t("startChat")}
					</Button>

					{allowEdit && (
						<div className="edit-actions">
							<IconHoverButton
								icon={<PencilIcon size={16} />}
								variant="secondary"
								onClick={handleEdit}
								size="medium"
							>
								{t("edit")}
							</IconHoverButton>

							<IconHoverButton
								icon={<TrashIcon size={16} />}
								variant="danger"
								onClick={handleDelete}
								disabled={deleting}
								size="medium"
							>
								{t("delete")}
							</IconHoverButton>
						</div>
					)}
				</div>

				{editVisible && (
					<Dialog
						isOpen={editVisible}
						onClose={closeEdit}
						title={`${t("edit")} ${item.name || t("cybot")}`}
					>
						<EditCybot initialValues={item} onClose={closeEdit} />
					</Dialog>
				)}
			</div>

			<style herf="cybot-block">{`
        .cybot-block {
          background: ${theme.background};
          border-radius: 12px;
          padding: 1.25rem;
          height: 100%;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          border: 1px solid ${theme.border};
          cursor: pointer;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
          transition: all ${animations.duration.normal} ease;
        }

        .cybot-block:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          transform: translateY(-2px);
        }

        .header {
          display: flex;
          align-items: center;
          gap: 0.8rem;
        }

        .avatar {
          width: 42px;
          height: 42px;
          border-radius: 10px;
          background: ${theme.backgroundTertiary};
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.1rem;
          color: ${theme.text};
          flex-shrink: 0;
          transition: transform ${animations.duration.normal} ease;
        }

        .cybot-block:hover .avatar {
          transform: scale(1.05);
        }

        .info {
          flex: 1;
          min-width: 0;
        }

        .title {
          font-size: 1rem;
          font-weight: 600;
          margin: 0;
          margin-bottom: 0.3rem;
          color: ${theme.text};
        }

        .tags {
          display: flex;
          gap: 0.4rem;
          flex-wrap: wrap;
        }

        .tag {
          font-size: 0.8rem;
          color: ${theme.textSecondary};
          padding: 0.2rem 0.5rem;
          background: ${theme.backgroundSecondary};
          border-radius: 4px;
          white-space: nowrap;
          transition: background ${animations.duration.fast} ease;
        }

        .tag:hover {
          background: ${theme.backgroundTertiary};
        }

        .description {
          flex: 1;
          font-size: 0.85rem;
          line-height: 1.6;
          color: ${theme.textTertiary};
          padding: 0.6rem 0;
          min-height: 3rem;
        }

        .actions {
          display: flex;
          gap: 0.75rem;
          margin-top: auto;
          align-items: center;
        }

        .edit-actions {
          display: flex;
          gap: 0.5rem;
        }
      `}</style>
		</>
	);
};

export default withTranslations<CybotBlockProps>(CybotBlock, ["chat", "ai"]);
