import EditCybot from "ai/cybot/EditCybot";
import { useCouldEdit } from "auth/useCouldEdit";
import { useCreateDialog } from "chat/dialog/useCreateDialog";
import { deleteData } from "database/dbSlice";
import withTranslations from "i18n/withTranslations";
import React, { useCallback, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { BASE_COLORS, GRADIENTS } from "render/styles/colors";
import { Dialog } from "render/ui/Dialog";
import { useModal } from "render/ui/Modal";

const CybotBlock = ({ item, closeModal }) => {
	const { t } = useTranslation();
	const { isLoading, createNewDialog } = useCreateDialog();
	const { visible: editVisible, open: openEdit, close: closeEdit } = useModal();
	const dispatch = useDispatch();
	const [deleting, setDeleting] = useState(false);
	const allowEdit = useCouldEdit(item.id);

	const avatarBackground =
		Object.values(GRADIENTS)[
			item.id.charCodeAt(0) % Object.values(GRADIENTS).length
		];

	const startDialog = async () => {
		try {
			await createNewDialog({ cybots: [item.id] });
			if (closeModal) closeModal();
		} catch (error) {
			toast.error("创建对话失败");
		}
	};

	const handleDelete = useCallback(async () => {
		setDeleting(true);
		try {
			await dispatch(deleteData({ id: item.id }));
			toast.success(t("deleteSuccess"));
		} catch (error) {
			toast.error(t("deleteError"));
		} finally {
			setDeleting(false);
		}
	}, [dispatch, item.id, t]);

	const handleEdit = (e) => {
		e.stopPropagation();
		openEdit();
	};

	return (
		<>
			<style>{`
        .cybot-block {
          transition: all 0.2s ease;
        }
        .cybot-block:hover {
          box-shadow: 0 4px 12px ${BASE_COLORS.shadowMedium};
          transform: translateY(-2px);
        }
        
        .start-button {
          transition: all 0.2s;
        }
        .start-button:hover {
          opacity: 0.9;
          transform: translateY(-1px);
        }
        .start-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        .edit-button {
          transition: all 0.2s;
        }
        .edit-button:hover {
          border-color: ${BASE_COLORS.borderHover};
          color: ${BASE_COLORS.text};
          background: ${BASE_COLORS.backgroundSecondary};
        }

        .delete-button {
          transition: all 0.2s;
        }
        .delete-button:hover:not(:disabled) {
          border-color: ${BASE_COLORS.error};
          background: ${BASE_COLORS.error + "10"};
        }
        .delete-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .avatar {
          transition: all 0.2s;
        }
        .cybot-block:hover .avatar {
          transform: scale(1.05);
        }

        .model-tag {
          transition: all 0.2s;
        }
        .cybot-block:hover .model-tag {
          background: ${BASE_COLORS.primaryGhost};
          color: ${BASE_COLORS.primary};
        }
      `}</style>

			<div
				className="cybot-block"
				style={{
					background: BASE_COLORS.background,
					borderRadius: "12px",
					padding: "1rem",
					height: "100%",
					display: "flex",
					flexDirection: "column",
					gap: "1rem",
					border: `1px solid ${BASE_COLORS.border}`,
					cursor: "pointer",
					boxShadow: `0 2px 8px ${BASE_COLORS.shadowLight}`,
				}}
			>
				<div
					style={{
						display: "flex",
						alignItems: "center",
						gap: "0.8rem",
					}}
				>
					<div
						className="avatar"
						style={{
							width: "42px",
							height: "42px",
							borderRadius: "10px",
							background: avatarBackground,
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							fontSize: "1.1rem",
							color: BASE_COLORS.text,
						}}
					>
						{item.name.charAt(0).toUpperCase()}
					</div>

					<div style={{ flex: 1 }}>
						<h3
							style={{
								fontSize: "1rem",
								fontWeight: 600,
								margin: 0,
								marginBottom: "0.3rem",
								color: BASE_COLORS.text,
							}}
						>
							{item.name}
						</h3>
						<div
							className="model-tag"
							style={{
								fontSize: "0.8rem",
								color: BASE_COLORS.textSecondary,
								padding: "0.2rem 0.5rem",
								background: BASE_COLORS.backgroundSecondary,
								borderRadius: "4px",
								display: "inline-block",
							}}
						>
							{item.model}
						</div>
					</div>
				</div>

				<div
					style={{
						flex: 1,
						fontSize: "0.85rem",
						lineHeight: 1.6,
						color: BASE_COLORS.textTertiary,
						padding: "0.6rem 0",
						borderTop: `1px solid ${BASE_COLORS.border}`,
						borderBottom: `1px solid ${BASE_COLORS.border}`,
					}}
				>
					{item.introduction}
				</div>

				<div
					style={{
						display: "flex",
						gap: "0.6rem",
						marginTop: "auto",
					}}
				>
					<button
						type="button"
						onClick={startDialog}
						disabled={isLoading}
						className="start-button"
						style={{
							flex: 2,
							padding: "0.6rem",
							borderRadius: "8px",
							border: "none",
							background: BASE_COLORS.primaryGradient,
							color: BASE_COLORS.background,
							fontWeight: 500,
							cursor: "pointer",
						}}
					>
						{isLoading ? "启动中..." : "开始对话"}
					</button>

					{allowEdit && (
						<>
							<button
								type="button"
								onClick={handleEdit}
								className="edit-button"
								style={{
									flex: 1,
									padding: "0.6rem",
									borderRadius: "8px",
									border: `1px solid ${BASE_COLORS.border}`,
									background: BASE_COLORS.background,
									color: BASE_COLORS.textSecondary,
									cursor: "pointer",
								}}
							>
								{t("edit")}
							</button>

							<button
								type="button"
								onClick={handleDelete}
								disabled={deleting}
								className="delete-button"
								style={{
									flex: 1,
									padding: "0.6rem",
									borderRadius: "8px",
									border: `1px solid ${BASE_COLORS.border}`,
									background: BASE_COLORS.background,
									color: deleting ? BASE_COLORS.placeholder : BASE_COLORS.error,
									cursor: "pointer",
								}}
							>
								{deleting ? "..." : t("delete")}
							</button>
						</>
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
		</>
	);
};

export default withTranslations(CybotBlock, ["chat", "ai"]);
