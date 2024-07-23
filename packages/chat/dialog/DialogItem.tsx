import React from "react";
import { NavLink } from "react-router-dom";
import { useAppDispatch, useFetchData } from "app/hooks";
import styled from "styled-components";
import { useSelector } from "react-redux";
import { selectTheme } from "app/theme/themeSlice";

import { initDialog } from "./dialogSlice";

const ItemContainer = styled.div`
  display: flex;
  align-items: center;
  padding: 8px 12px;
  border-radius: 6px;
  transition: background-color 0.2s;

  &:hover {
    background-color: ${(props) => props.theme.surface2};
  }

  ${(props) =>
    props.isSelected &&
    `
    background-color: ${props.theme.surface3};
  `}
`;

const StyledNavLink = styled(NavLink)`
  color: ${(props) => props.theme.text1};
  text-decoration: none;
  flex-grow: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 14px;
`;

export const DialogItem = ({ id, isSelected, source }) => {
  const dispatch = useAppDispatch();
  const { data: dialog } = useFetchData(id, { source });
  const theme = useSelector(selectTheme);

  const title = dialog?.title || dialog.id;

  return (
    <ItemContainer isSelected={isSelected} theme={theme}>
      <StyledNavLink
        to={`/chat?dialogId=${dialog.id}`}
        onClick={() =>
          dispatch(initDialog({ dialogId: dialog.id, source: dialog.source }))
        }
      >
        {title}
      </StyledNavLink>
    </ItemContainer>
  );
};
