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
  fetchUserSpaceMemberships,
  selectAllMemberSpaces,
  selectCurrentSpace,
  selectSpaceLoading, // 新增导入
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
  const spaces = useAppSelector(selectAllMemberSpaces) || [];
  const space = useAppSelector(selectCurrentSpace);
  const loading = useAppSelector(selectSpaceLoading);

  useEffect(() => {
    const fetchSpaces = async () => {
      if (currentUserId && !loading && (!spaces || spaces.length === 0)) {
        try {
          await dispatch(fetchUserSpaceMemberships(currentUserId)).unwrap();
        } catch (error) {
          console.error("Failed to fetch spaces in SidebarTop:", error);
        }
      }
    };

    fetchSpaces();
  }, [currentUserId, spaces, loading, dispatch]);

  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const { visible, open: openModal, close: closeModal } = useModal();

  const spacesLength = spaces.length;
  const listRef = React.useRef<Array<HTMLElement | null>>(
    new Array(spacesLength + 1).fill(null)
  );

  useEffect(() => {
    listRef.current = Array(spaces.length + 1).fill(null);
  }, [spaces.length]);

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
          className={`space-dropdown__trigger ${isOpen ? "is-open" : ""} ${loading ? "is-loading" : ""}`}
          aria-label={t("select_space")}
          aria-expanded={isOpen}
          disabled={loading}
        >
          <span className="space-dropdown__name" title={space?.name}>
            {loading ? t("loading") : space?.name || t("select_space")}
          </span>
          <RxDropdownMenu size={14} className="space-dropdown__icon" />
        </button>

        {isMounted && !loading && (
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
              aria-label={t("space_list")}
            >
              <div className="space-dropdown__content">
                {spaces.length > 0 ? (
                  <div className="space-dropdown__section">
                    {spaces.map((spaceItem: any, index: number) => (
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
                ) : (
                  <div className="space-dropdown__empty">{t("no_spaces")}</div>
                )}

                <CreateSpaceButton
                  onClick={openModal}
                  getItemProps={getItemProps}
                  listRef={(node) => (listRef.current[spacesLength] = node)}
                  index={spacesLength}
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
          padding: 16px;
          gap: 12px;
          align-items: center;
          background: ${theme.background};
        }

        .space-dropdown {
          flex: 1;
          min-width: 0;
          position: relative;
        }

        .space-dropdown__trigger {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          height: 32px;
          padding: 0 12px;
          border-radius: 6px;
          cursor: pointer;
          background: ${theme.backgroundSecondary};
          border: 1px solid transparent;
          transition: all 0.15s ease;
          font-weight: 500;
          color: ${theme.text};
        }

        .space-dropdown__trigger:hover {
          background: ${theme.backgroundHover};
        }

        .space-dropdown__trigger.is-open {
          background: ${theme.backgroundActive || theme.backgroundHover};
          border-color: ${theme.primary};
          box-shadow: 0 0 0 1px ${theme.primaryLight};
        }

        .space-dropdown__trigger.is-loading {
          opacity: 0.7;
          cursor: default;
        }

        .space-dropdown__trigger:focus-visible {
          outline: none;
          box-shadow: 0 0 0 2px ${theme.primaryLight};
          border-color: ${theme.primary};
        }

        .space-dropdown__name {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-size: 13px;
          color: ${theme.text};
          flex: 1;
          min-width: 0;
          margin-right: 8px;
        }

        .space-dropdown__icon {
          transition:
            transform 0.2s ease,
            color 0.2s ease;
          transform: ${isOpen ? "rotate(180deg)" : "rotate(0deg)"};
          color: ${isOpen ? theme.primary : theme.textTertiary};
          flex-shrink: 0;
        }

        .space-dropdown__menu {
          background: ${theme.background};
          border-radius: 10px;
          box-shadow:
            0 6px 20px ${theme.shadowMedium},
            0 0 0 1px ${theme.border};
          overflow: hidden;
          z-index: ${zIndex.spaceDropdownZIndex};
          margin-top: 6px;
          backdrop-filter: blur(8px);
        }

        .space-dropdown__content {
          max-height: 340px;
          overflow-y: auto;
          padding: 6px;
        }

        .space-dropdown__section {
          position: relative;
        }

        .space-dropdown__empty {
          padding: 12px;
          font-size: 13px;
          color: ${theme.textSecondary};
          text-align: center;
          margin: 4px 0;
        }

        .space-dropdown__content::-webkit-scrollbar {
          width: 5px;
          height: 5px;
        }

        .space-dropdown__content::-webkit-scrollbar-track {
          background: transparent;
        }

        .space-dropdown__content::-webkit-scrollbar-thumb {
          background: ${theme.textLight};
          border-radius: 10px;
        }

        .space-dropdown__content::-webkit-scrollbar-thumb:hover {
          background: ${theme.textQuaternary};
        }

        .space-dropdown__content {
          scrollbar-width: thin;
          scrollbar-color: ${theme.textLight} transparent;
        }
      `}</style>
    </div>
  );
};
