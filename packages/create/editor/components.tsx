import React from "react";
import ReactDOM from "react-dom";
// 引入需要的图标
import {
  MdFormatBold,
  MdFormatItalic,
  MdFormatUnderlined,
  MdCode,
  MdFormatQuote,
  MdFormatListBulleted,
  MdFormatListNumbered,
  MdLooksOne,
  MdLooksTwo,
  MdFormatAlignLeft,
  MdFormatAlignCenter,
  MdFormatAlignRight,
  MdFormatAlignJustify,
} from "react-icons/md";

export const Button = React.forwardRef(
  ({ className, active, reversed, ...props }, ref) => (
    <span
      {...props}
      ref={ref}
      className={className}
      style={{
        cursor: "pointer",
        color: reversed
          ? active
            ? "white"
            : "#aaa"
          : active
            ? "black"
            : "#ccc",
      }}
    />
  ),
);

// 导出所有图标组件,方便使用
export const Icons = {
  bold: MdFormatBold,
  italic: MdFormatItalic,
  underline: MdFormatUnderlined,
  code: MdCode,
  quote: MdFormatQuote,
  bulletedList: MdFormatListBulleted,
  numberedList: MdFormatListNumbered,
  h1: MdLooksOne,
  h2: MdLooksTwo,
  alignLeft: MdFormatAlignLeft,
  alignCenter: MdFormatAlignCenter,
  alignRight: MdFormatAlignRight,
  alignJustify: MdFormatAlignJustify,
};

export const Instruction = React.forwardRef(({ className, ...props }, ref) => (
  <div
    {...props}
    ref={ref}
    className={className}
    style={{
      whiteSpace: "pre-wrap",
      margin: "0 -20px 10px",
      padding: "10px 20px",
      fontSize: "14px",
      background: "#f8f8e8",
    }}
  />
));

export const Portal = ({ children }) => {
  return typeof document === "object"
    ? ReactDOM.createPortal(children, document.body)
    : null;
};

export const Menu = React.forwardRef(({ className, style, ...props }, ref) => (
  <div
    {...props}
    data-test-id="menu"
    ref={ref}
    style={{
      ...style,
      display: "flex",
      gap: "15px",
    }}
  />
));

export const Toolbar = React.forwardRef(
  ({ className, style, ...props }, ref) => (
    <Menu
      {...props}
      ref={ref}
      style={{
        position: "relative",
        padding: "1px 18px 17px",
        margin: "0 -20px",
        borderBottom: "2px solid #eee",
        marginBottom: "20px",
        ...style,
      }}
    />
  ),
);
