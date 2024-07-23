import React from "react";
import { useTranslation } from "react-i18next";
import { useModal, Dialog } from "render/ui";
import { NorthStarIcon, PlusIcon } from "@primer/octicons-react";
import styled from "styled-components";
import AI from "ai/blocks/AI";

import { DialogList } from "./DialogList";
import CreateCybot from "ai/cybot/CreateCybot";

const SidebarContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: ${(props) => props.theme.surface1};
`;

const HeaderBar = styled.div`
  padding: 16px;
  display: flex;
  justify-content: space-between;
  gap: 8px;
`;

const StyledButton = styled.button`
  flex: 1;
  font-size: 13px;
  font-weight: 500;
  line-height: 1.4;
  border-radius: 6px;
  padding: 8px 12px;
  background-color: ${(props) => props.theme.surface2};
  color: ${(props) => props.theme.text1};
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.2s ease-in-out;
  outline: none;

  &:hover {
    background-color: ${(props) => props.theme.surface3};
  }

  &:active {
    background-color: ${(props) => props.theme.surface4};
  }

  &:focus {
    box-shadow: 0 0 0 2px ${(props) => props.theme.link};
  }

  svg {
    color: ${(props) => props.theme.text2};
  }
`;

const ButtonText = styled.span`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ScrollableContent = styled.div`
  flex-grow: 1;
  overflow-y: auto;
  padding: 0 16px 16px;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: ${(props) => props.theme.scrollthumbColor};
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: ${(props) => props.theme.text2};
  }
`;

const DialogTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 15px 0;
  padding: 0;
  line-height: 1.4;
  color: ${(props) => props.theme.text1};
`;

const DialogSideBar = ({ dialogList }) => {
  const { t } = useTranslation();
  const {
    visible: configModalVisible,
    open: openConfigModal,
    close: closeConfigModal,
  } = useModal();
  const {
    visible: AIsModalVisible,
    open: openAIsModal,
    close: closeAIsModal,
  } = useModal();

  return (
    <SidebarContainer>
      <HeaderBar>
        <StyledButton onClick={openConfigModal}>
          <PlusIcon size={14} />
          <ButtonText>{t("customizeAI")}</ButtonText>
        </StyledButton>
        <StyledButton onClick={openAIsModal}>
          <NorthStarIcon size={14} />
          <ButtonText>{t("newDialog")}</ButtonText>
        </StyledButton>
      </HeaderBar>

      <ScrollableContent>
        <DialogList dialogList={dialogList} />
      </ScrollableContent>

      <Dialog
        isOpen={configModalVisible}
        onClose={closeConfigModal}
        title={<DialogTitle>{t("createRobot")}</DialogTitle>}
      >
        <CreateCybot onClose={closeConfigModal} />
      </Dialog>

      <Dialog
        isOpen={AIsModalVisible}
        onClose={closeAIsModal}
        title={<DialogTitle>{t("createDialog")}</DialogTitle>}
      >
        <AI />
      </Dialog>
    </SidebarContainer>
  );
};

export default DialogSideBar;
