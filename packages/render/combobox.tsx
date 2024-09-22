import * as Ariakit from "@ariakit/react";
import * as React from "react";
import { useAppSelector } from "app/hooks";
import { selectTheme } from "app/theme/themeSlice";

const useComboboxStyles = () => {
  const theme = useAppSelector(selectTheme);
  return {
    combobox: {
      height: "2.5rem",
      width: "250px",
      borderRadius: "0.375rem",
      borderStyle: "none",
      backgroundColor: theme.surface2,
      color: theme.text1,
      paddingLeft: "1rem",
      paddingRight: "1rem",
      fontSize: "1rem",
      lineHeight: "1.5rem",
      outlineWidth: "1px",
      outlineOffset: "-1px",
      outlineColor: theme.accentColor,
      boxShadow: `inset 0 0 0 1px ${theme.surface3}, inset 0 2px 5px 0 rgba(0, 0, 0, 0.08)`,
    },
    comboboxHover: {
      backgroundColor: theme.surface3,
    },
    comboboxFocus: {
      outlineStyle: "solid",
    },
    comboboxActiveItem: {
      outlineWidth: "2px",
    },
    popover: {
      position: "relative",
      zIndex: 50,
      display: "flex",
      maxHeight: "min(var(--popover-available-height, 300px), 300px)",
      flexDirection: "column",
      overflow: "auto",
      overscrollBehavior: "contain",
      borderRadius: "0.5rem",
      borderWidth: "1px",
      borderStyle: "solid",
      borderColor: theme.surface3,
      backgroundColor: theme.surface1,
      padding: "0.5rem",
      color: theme.text1,
      outline: "2px solid transparent",
      outlineOffset: "2px",
      boxShadow:
        "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)",
    },
    item: {
      display: "flex",
      cursor: "default",
      scrollMargin: "0.5rem",
      alignItems: "center",
      gap: "0.5rem",
      borderRadius: "0.25rem",
      padding: "0.5rem",
      outline: "none",
      color: theme.text1,
    },
    itemHover: {
      backgroundColor: theme.surface2,
    },
    itemActive: {
      backgroundColor: theme.accentColor,
      color: theme.surface1,
      paddingTop: "9px",
      paddingBottom: "7px",
    },
    separator: {
      marginTop: "0.5rem",
      marginBottom: "0.5rem",
      height: "0px",
      width: "100%",
      borderTopWidth: "1px",
      borderColor: theme.surface3,
    },
    groupLabel: {
      cursor: "default",
      padding: "0.5rem",
      fontSize: "0.875rem",
      lineHeight: "1.25rem",
      fontWeight: 500,
      color: theme.text2,
    },
    noResults: {
      gap: "0.5rem",
      padding: "0.5rem",
      color: theme.text2,
    },
  };
};

export const Combobox = React.forwardRef(function Combobox(
  { value, onChange, children, ...props },
  ref,
) {
  const styles = useComboboxStyles();
  const [isHovered, setIsHovered] = React.useState(false);
  const [isFocused, setIsFocused] = React.useState(false);

  const combinedStyle = {
    ...styles.combobox,
    ...(isHovered ? styles.comboboxHover : {}),
    ...(isFocused ? styles.comboboxFocus : {}),
  };

  return (
    <Ariakit.ComboboxProvider value={value} setValue={onChange}>
      <Ariakit.Combobox
        ref={ref}
        style={combinedStyle}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        {...props}
      />
      <Ariakit.ComboboxPopover
        portal
        sameWidth
        gutter={4}
        style={styles.popover}
      >
        {children}
      </Ariakit.ComboboxPopover>
    </Ariakit.ComboboxProvider>
  );
});

export const ComboboxGroup = React.forwardRef(function ComboboxGroup(
  { label, children, ...props },
  ref,
) {
  const styles = useComboboxStyles();
  return (
    <Ariakit.ComboboxGroup ref={ref} {...props}>
      {label && (
        <Ariakit.ComboboxGroupLabel style={styles.groupLabel}>
          {label}
        </Ariakit.ComboboxGroupLabel>
      )}
      {children}
    </Ariakit.ComboboxGroup>
  );
});

export const ComboboxItem = React.forwardRef(function ComboboxItem(props, ref) {
  const styles = useComboboxStyles();
  const [isHovered, setIsHovered] = React.useState(false);
  const [isActive, setIsActive] = React.useState(false);

  const combinedStyle = {
    ...styles.item,
    ...(isHovered ? styles.itemHover : {}),
    ...(isActive ? styles.itemActive : {}),
  };

  return (
    <Ariakit.ComboboxItem
      ref={ref}
      focusOnHover
      style={combinedStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseDown={() => setIsActive(true)}
      onMouseUp={() => setIsActive(false)}
      {...props}
    />
  );
});

export const ComboboxSeparator = React.forwardRef(
  function ComboboxSeparator(props, ref) {
    const styles = useComboboxStyles();
    return (
      <Ariakit.ComboboxSeparator
        ref={ref}
        style={styles.separator}
        {...props}
      />
    );
  },
);

export const NoResults = ({ children }) => {
  const styles = useComboboxStyles();
  return <div style={styles.noResults}>{children}</div>;
};
