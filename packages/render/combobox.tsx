import * as Ariakit from "@ariakit/react";
import * as React from "react";
import styled, { css } from "styled-components";

// Styled components
const StyledCombobox = styled(Ariakit.Combobox)`
  height: 2.5rem;
  width: 250px;
  border-radius: 0.375rem;
  border-style: none;
  background-color: ${(props) => props.theme.surface2};
  color: ${(props) => props.theme.text1};
  padding-left: 1rem;
  padding-right: 1rem;
  font-size: 1rem;
  line-height: 1.5rem;
  outline-width: 1px;
  outline-offset: -1px;
  outline-color: ${(props) => props.theme.accentColor};
  box-shadow:
    inset 0 0 0 1px ${(props) => props.theme.surface3},
    inset 0 2px 5px 0 rgba(0, 0, 0, 0.08);

  &::placeholder {
    color: ${(props) => props.theme.text2};
  }

  &:hover {
    background-color: ${(props) => props.theme.surface3};
  }

  &[data-focus-visible] {
    outline-style: solid;
  }

  &[data-active-item] {
    outline-width: 2px;
  }
`;

const StyledPopover = styled(Ariakit.ComboboxPopover)`
  position: relative;
  z-index: 50;
  display: flex;
  max-height: min(var(--popover-available-height, 300px), 300px);
  flex-direction: column;
  overflow: auto;
  overscroll-behavior: contain;
  border-radius: 0.5rem;
  border-width: 1px;
  border-style: solid;
  border-color: ${(props) => props.theme.surface3};
  background-color: ${(props) => props.theme.surface1};
  padding: 0.5rem;
  color: ${(props) => props.theme.text1};
  outline: 2px solid transparent;
  outline-offset: 2px;
  box-shadow:
    0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -4px rgba(0, 0, 0, 0.1);
`;

const StyledItem = styled(Ariakit.ComboboxItem)`
  display: flex;
  cursor: default;
  scroll-margin: 0.5rem;
  align-items: center;
  gap: 0.5rem;
  border-radius: 0.25rem;
  padding: 0.5rem;
  outline: none !important;
  color: ${(props) => props.theme.text1};

  &:hover {
    background-color: ${(props) => props.theme.surface2};
  }

  &[data-active-item] {
    background-color: ${(props) => props.theme.accentColor};
    color: ${(props) => props.theme.surface1};
  }

  &:active,
  &[data-active] {
    padding-top: 9px;
    padding-bottom: 7px;
  }
`;

const StyledSeparator = styled(Ariakit.ComboboxSeparator)`
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
  height: 0px;
  width: 100%;
  border-top-width: 1px;
  border-color: ${(props) => props.theme.surface3};
`;

const StyledGroupLabel = styled(Ariakit.ComboboxGroupLabel)`
  cursor: default;
  padding: 0.5rem;
  font-size: 0.875rem;
  line-height: 1.25rem;
  font-weight: 500;
  color: ${(props) => props.theme.text2};
`;

// Component definitions
export interface ComboboxProps extends Omit<Ariakit.ComboboxProps, "onChange"> {
  value?: string;
  onChange?: (value: string) => void;
}

export const Combobox = React.forwardRef<HTMLInputElement, ComboboxProps>(
  function Combobox({ value, onChange, children, ...props }, ref) {
    return (
      <Ariakit.ComboboxProvider value={value} setValue={onChange}>
        <StyledCombobox ref={ref} {...props} />
        <StyledPopover portal sameWidth gutter={4}>
          {children}
        </StyledPopover>
      </Ariakit.ComboboxProvider>
    );
  },
);

export interface ComboboxGroupProps extends Ariakit.ComboboxGroupProps {
  label?: React.ReactNode;
  children?: React.ReactNode;
}

export const ComboboxGroup = React.forwardRef<
  HTMLDivElement,
  ComboboxGroupProps
>(function ComboboxGroup({ label, children, ...props }, ref) {
  return (
    <Ariakit.ComboboxGroup ref={ref} {...props}>
      {label && <StyledGroupLabel>{label}</StyledGroupLabel>}
      {children}
    </Ariakit.ComboboxGroup>
  );
});

export interface ComboboxItemProps extends Ariakit.ComboboxItemProps {}

export const ComboboxItem = React.forwardRef<HTMLDivElement, ComboboxItemProps>(
  function ComboboxItem(props, ref) {
    return <StyledItem ref={ref} focusOnHover {...props} />;
  },
);

export interface ComboboxSeparatorProps
  extends Ariakit.ComboboxSeparatorProps {}

export const ComboboxSeparator = React.forwardRef<
  HTMLHRElement,
  ComboboxSeparatorProps
>(function ComboboxSeparator(props, ref) {
  return <StyledSeparator ref={ref} {...props} />;
});

export const NoResults = styled.div`
  gap: 0.5rem;
  padding: 0.5rem;
  color: ${(props) => props.theme.text2};
`;
