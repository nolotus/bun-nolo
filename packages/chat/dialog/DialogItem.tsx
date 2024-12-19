import * as Ariakit from "@ariakit/react";
import { CommentIcon } from "@primer/octicons-react";
import { useFetchData } from "app/hooks";
import { selectTheme } from "app/theme/themeSlice";
import { DialogContextMenu } from "chat/dialog/DialogContextMenu";
import React from "react";
import { useSelector } from "react-redux";
import { NavLink, useParams } from "react-router-dom";
import { BASE_COLORS } from "render/styles/colors";

export const SIZES = {
	small: 16,
	medium: 20,
	large: 24,
};

export const DialogItem = ({ id, isCreator, categoryId, size = "medium" }) => {
	const { data: dialog } = useFetchData(id);
	const { pageId } = useParams();
	const theme = useSelector(selectTheme);

	const menu = Ariakit.useMenuStore();
	const [anchorRect, setAnchorRect] = React.useState({ x: 0, y: 0 });

	if (!dialog) return null;

	const iconSize = SIZES[size];
	const title = dialog.title || dialog.id;
	const isSelected = dialog.id === pageId;

	const handleContextMenu = (event) => {
		event.preventDefault();
		event.stopPropagation();
		setAnchorRect({ x: event.clientX, y: event.clientY });
		menu.show();
	};

	return (
		<>
			<style>
				{`
          .dialog-item {
            margin-bottom: 1px;
            padding: ${iconSize / 5}px ${iconSize * 0.8}px;
            transition: all 0.15s ease;
            display: flex;
            align-items: center;
            cursor: pointer;
            height: ${iconSize * 1.4}px;
            background-color: transparent;
          }

          .dialog-item:hover {
            background-color: ${BASE_COLORS.backgroundGhost};
          }

          .dialog-item.selected {
            background-color: ${BASE_COLORS.primaryGhost};
          }

          .dialog-link {
            font-size: ${iconSize / 1.7}px;
            line-height: 1.4;
            color: ${BASE_COLORS.textTertiary};
            flex-grow: 1;
            font-weight: 400;
            text-decoration: none;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            padding-left: ${iconSize / 1.7}px;
          }

          .dialog-item:hover .dialog-link {
            color: ${BASE_COLORS.textSecondary};
          }

          .dialog-item.selected .dialog-link {
            color: ${BASE_COLORS.primary};
            font-weight: 500;
          }

          .dialog-icon {
            color: ${BASE_COLORS.icon};
            opacity: 0.7;
          }

          .dialog-item.selected .dialog-icon {
            color: ${BASE_COLORS.primary};
            opacity: 1;
          }
        `}
			</style>

			<div
				className={`dialog-item ${isSelected ? "selected" : ""}`}
				onContextMenu={handleContextMenu}
			>
				<CommentIcon size={iconSize} className="dialog-icon" />
				<NavLink to={`/${dialog.id}`} className="dialog-link">
					{title}
				</NavLink>

				<DialogContextMenu
					menu={menu}
					anchorRect={anchorRect}
					dialogId={dialog.id}
				/>
			</div>
		</>
	);
};
