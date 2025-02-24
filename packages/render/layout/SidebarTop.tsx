import {
  FloatingFocusManager,
  autoUpdate,
  flip,
  offset,
  shift,
  size,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
  useListNavigation,
  useRole,
  useTransitionStyles,
} from "@floating-ui/react";
import { useAppDispatch, useAppSelector } from "app/hooks";
import { CreateSpaceForm } from "create/space/CreateSpaceForm";
import {
  changeSpace,
  selectAllMemberSpaces,
  selectCurrentSpace,
} from "create/space/spaceSlice";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { RxDropdownMenu } from "react-icons/rx";
import { useNavigate } from "react-router-dom";
import { Dialog } from "render/ui/Dialog";
import { useModal } from "render/ui/Modal";
import { ProjectIcon } from "@primer/octicons-react";
import { useTheme } from "app/theme";
import { zIndex } from "../styles/zIndex";
import NavIconItem from "./blocks/NavIconItem";
import { CreateSpaceButton } from "create/space/CreateSpaceButton";
import { selectCurrentUserId } from "auth/authSlice";
import { createSpaceKey } from "create/space/spaceKeys";

import { SpaceItem } from "create/space/components/SpaceItem";

export const SidebarTop = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const currentUserId = useAppSelector(selectCurrentUserId);
  const spaces = useAppSelector(selectAllMemberSpaces);
  const space = useAppSelector(selectCurrentSpace);

  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const { visible, open: openModal, close: closeModal } = useModal();

  const listRef = React.useRef<Array<HTMLElement | null>>(
    new Array(spaces?.length || 0 + 1).fill(null)
  );

  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    placement: "bottom-start",
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(4),
      flip(),
      shift(),
      size({
        apply({ rects, elements }) {
          Object.assign(elements.floating.style, {
            width: `${rects.reference.width}px`,
          });
        },
      }),
    ],
  });

  const { isMounted, styles: transitionStyles } = useTransitionStyles(context, {
    initial: { opacity: 0, transform: "translateY(-4px)" },
    open: { opacity: 1, transform: "translateY(0)" },
    close: { opacity: 0, transform: "translateY(-4px)" },
    duration: { open: 150, close: 100 },
  });

  const click = useClick(context);
  const dismiss = useDismiss(context);
  const role = useRole(context);
  const listNavigation = useListNavigation(context, {
    listRef,
    activeIndex,
    onNavigate: setActiveIndex,
    loop: true,
  });

  const { getReferenceProps, getFloatingProps, getItemProps } = useInteractions(
    [click, dismiss, role, listNavigation]
  );

  const handleOptionClick = (spaceId?: string) => {
    if (!spaceId) return;
    dispatch(changeSpace(spaceId));
    setIsOpen(false);
  };

  const handleSettingsClick = (
    e: React.MouseEvent,
    spaceMemberpath: string
  ) => {
    e.stopPropagation();
    const spaceId = createSpaceKey.spaceIdFromMember(spaceMemberpath);
    navigate(`/space/${spaceId}/settings`);
    setIsOpen(false);
  };

  const isCurrentSpace = (spaceId: string) => space?.id === spaceId;

  return (
    <div className="space-sidebar-top" role="navigation">
      <NavIconItem path="/create" icon={<ProjectIcon size={22} />} />

      <div className="space-dropdown">
        <button
          ref={refs.setReference}
          {...getReferenceProps()}
          className="space-dropdown__trigger"
          aria-label={t("选择空间")}
          aria-expanded={isOpen}
        >
          <span className="space-dropdown__name" title={space?.name}>
            {space?.name || t("选择空间")}
          </span>
          <RxDropdownMenu size={14} className="space-dropdown__icon" />
        </button>

        {isMounted && (
          <FloatingFocusManager context={context} modal={false}>
            <div
              ref={refs.setFloating}
              style={{
                ...floatingStyles,
                ...transitionStyles,
              }}
              {...getFloatingProps()}
              className="space-dropdown__menu"
              role="listbox"
              aria-label={t("空间列表")}
            >
              <div className="space-dropdown__content">
                {spaces?.length > 0 && (
                  <div className="space-dropdown__section">
                    {spaces?.map((spaceItem: any, index: number) => (
                      <SpaceItem
                        key={spaceItem.dbKey}
                        spaceItem={spaceItem}
                        isCurrentSpace={isCurrentSpace(spaceItem.spaceId)}
                        index={index}
                        listRef={(node) => (listRef.current[index] = node)}
                        getItemProps={getItemProps}
                        onSelect={handleOptionClick}
                        onSettingsClick={handleSettingsClick}
                      />
                    ))}
                  </div>
                )}

                <CreateSpaceButton
                  onClick={openModal}
                  getItemProps={getItemProps}
                  listRef={(node) =>
                    (listRef.current[spaces?.length || 0] = node)
                  }
                  index={spaces?.length || 0}
                />
              </div>
            </div>
          </FloatingFocusManager>
        )}
      </div>

      <Dialog isOpen={visible} onClose={closeModal}>
        <CreateSpaceForm onClose={closeModal} />
      </Dialog>

      <style jsx>{`
        .space-sidebar-top {
          display: flex;
          padding: 12px 16px;
          gap: 12px;
          align-items: center;
        }

        .space-dropdown {
          flex: 1;
          min-width: 0;
          position: relative;
        }

        .space-dropdown__trigger {
          display: flex;
          align-items: center;
          width: 100%;
          height: 28px;
          padding: 0 10px;
          border-radius: 4px;
          cursor: pointer;
          background: ${theme.background};
          border: 1px solid ${isOpen ? theme.borderHover : theme.border};
          transition: all 0.2s ease;
          box-shadow: ${isOpen ? `0 1px 4px ${theme.shadowLight}` : "none"};
        }

        .space-dropdown__trigger:hover {
          border-color: ${theme.borderHover};
        }

        .space-dropdown__trigger:focus-visible {
          outline: 2px solid ${theme.primary};
          outline-offset: -1px;
        }

        .space-dropdown__name {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-size: 13px;
          font-weight: 500;
          color: ${theme.text};
          flex: 1;
          min-width: 0;
        }

        .space-dropdown__icon {
          margin-left: 6px;
          transition: transform 0.2s ease;
          transform: ${isOpen ? "rotate(180deg)" : "rotate(0deg)"};
          color: ${theme.textSecondary};
          flex-shrink: 0;
        }

        .space-dropdown__menu {
          background: ${theme.background};
          border-radius: 6px;
          border: 1px solid ${theme.border};
          box-shadow: 0 4px 12px ${theme.shadowMedium};
          overflow: hidden;
          z-index: ${zIndex.spaceDropdownZIndex};
          margin-top: 4px;
        }

        .space-dropdown__content {
          max-height: 320px;
          overflow-y: auto;
          padding: 4px;
        }

        .space-dropdown__section {
          position: relative;
        }

        .space-dropdown__content::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        .space-dropdown__content::-webkit-scrollbar-track {
          background: transparent;
        }

        .space-dropdown__content::-webkit-scrollbar-thumb {
          background: ${theme.border};
          border-radius: 4px;
          border: 2px solid ${theme.background};
        }

        .space-dropdown__content::-webkit-scrollbar-thumb:hover {
          background: ${theme.borderHover};
        }

        .space-dropdown__content {
          scrollbar-width: thin;
          scrollbar-color: ${theme.border} transparent;
        }
      `}</style>
    </div>
  );
};
