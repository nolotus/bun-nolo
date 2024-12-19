import EditCybot from "ai/cybot/EditCybot";
import { useCouldEdit } from "auth/useCouldEdit";
import { useCreateDialog } from "chat/dialog/useCreateDialog";
import { deleteData } from "database/dbSlice";
import withTranslations from "i18n/withTranslations";
import debounce from "lodash/debounce";
import PropTypes from "prop-types";
import React, { useCallback, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { GRADIENTS, defaultTheme } from "render/styles/colors";
import { Dialog } from "render/ui/Dialog";
import { useModal } from "render/ui/Modal";

const buttonBaseStyle = {
	padding: "0.6rem",
	borderRadius: "8px",
	cursor: "pointer",
};

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
          box-shadow: 0 4px 12px ${defaultTheme.shadowMedium};
          transform: translateY(-2px);
        }
        
        .start-button {
          transition: all 0.2s;
        }
        .start-button:hover:not(:disabled) {
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
          border-color: ${defaultTheme.borderHover};
          color: ${defaultTheme.text};
          background: ${defaultTheme.backgroundSecondary};
        }

        .delete-button {
          transition: all 0.2s;
        }
        .delete-button:hover:not(:disabled) {
          border-color: ${defaultTheme.error};
          background: rgba(239, 68, 68, 0.1);
        }
        .delete-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
      `}</style>

			<div
				className="cybot-block"
				style={{
					background: defaultTheme.background,
					borderRadius: "12px",
					padding: "1rem",
					height: "100%",
					display: "flex",
					flexDirection: "column",
					gap: "1rem",
					border: `1px solid ${defaultTheme.border}`,
					cursor: "pointer",
					boxShadow: `0 2px 8px ${defaultTheme.shadowLight}`,
				}}
			>
				<div style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}>
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
							color: defaultTheme.text,
						}}
					>
						{item.name?.[0]?.toUpperCase() || "?"}
					</div>

					<div style={{ flex: 1 }}>
						<h3
							style={{
								fontSize: "1rem",
								fontWeight: 600,
								margin: 0,
								marginBottom: "0.3rem",
								color: defaultTheme.text,
							}}
						>
							{item.name || t("unnamed")}
						</h3>
						<div
							className="model-tag"
							style={{
								fontSize: "0.8rem",
								color: defaultTheme.textSecondary,
								padding: "0.2rem 0.5rem",
								background: defaultTheme.backgroundSecondary,
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
						color: defaultTheme.textTertiary,
						padding: "0.6rem 0",
						borderTop: `1px solid ${defaultTheme.border}`,
						borderBottom: `1px solid ${defaultTheme.border}`,
					}}
				>
					{item.introduction || t("noDescription")}
				</div>

				<div style={{ display: "flex", gap: "0.6rem", marginTop: "auto" }}>
					<button
						type="button"
						onClick={startDialog}
						disabled={isLoading}
						className="start-button"
						style={{
							...buttonBaseStyle,
							flex: 2,
							border: "none",
							background: defaultTheme.primaryGradient,
							color: defaultTheme.background,
							fontWeight: 500,
						}}
					>
						{isLoading ? t("starting") : t("startChat")}
					</button>

					{allowEdit && (
						<>
							<button
								type="button"
								onClick={handleEdit}
								className="edit-button"
								style={{
									...buttonBaseStyle,
									flex: 1,
									border: `1px solid ${defaultTheme.border}`,
									background: defaultTheme.background,
									color: defaultTheme.textSecondary,
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
									...buttonBaseStyle,
									flex: 1,
									border: `1px solid ${defaultTheme.border}`,
									background: defaultTheme.background,
									color: deleting
										? defaultTheme.placeholder
										: defaultTheme.error,
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

CybotBlock.propTypes = {
	item: PropTypes.shape({
		id: PropTypes.string.isRequired,
		name: PropTypes.string,
		model: PropTypes.string.isRequired,
		introduction: PropTypes.string,
	}).isRequired,
	closeModal: PropTypes.func,
};

export default withTranslations(CybotBlock, ["chat", "ai"]);
