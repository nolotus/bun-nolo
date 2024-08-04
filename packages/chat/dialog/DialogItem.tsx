import React from "react";
import { NavLink } from "react-router-dom";
import { useAppDispatch, useFetchData } from "app/hooks";
import styled from "styled-components";
import { useSelector } from "react-redux";
import { selectTheme } from "app/theme/themeSlice";
import { initDialog } from "./dialogSlice";

const ItemContainer = styled.div`
  margin-bottom: 2px;
  border-radius: 4px;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${({ theme }) => theme.surface2};
  }

  ${({ theme, isSelected }) =>
    isSelected &&
    `
    background-color: ${theme.surface3};
  `}
`;

const StyledNavLink = styled(NavLink)`
  display: block;
  color: ${({ theme }) => theme.text1};
  text-decoration: none;
  padding: 6px 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 13px;
  transition: color 0.2s ease;

  &:hover {
    color: ${({ theme }) => theme.accentColor};
  }
`;

export const DialogItem = ({ id, isSelected, source }) => {
  const dispatch = useAppDispatch();
  const { data: dialog } = useFetchData(id, { source });
  const theme = useSelector(selectTheme);

  const title = dialog?.title || dialog.id;

  return (
    <ItemContainer
      isSelected={isSelected}
      theme={theme}
      onClick={() =>
        dispatch(initDialog({ dialogId: dialog.id, source: dialog.source }))
      }
    >
      <StyledNavLink to={`/chat?dialogId=${dialog.id}`} theme={theme}>
        {title}
      </StyledNavLink>
    </ItemContainer>
  );
};
