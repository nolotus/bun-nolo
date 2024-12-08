const TextLeaf: React.FC<TextLeafProps> = ({ attributes, children, leaf }) => {
  const { text, ...rest } = leaf;
  let node = children;

  const commonStyle = {
    textDecorationThickness: "0.1em",
  };

  if (leaf.bold) {
    node = <strong style={{ fontWeight: 600 }}>{node}</strong>;
  }
  if (leaf.italic) {
    node = <em style={{ fontStyle: "italic" }}>{node}</em>;
  }
  if (leaf.underline) {
    node = (
      <u style={{ ...commonStyle, textUnderlineOffset: "0.2em" }}>{node}</u>
    );
  }
  if (leaf.strikethrough) {
    node = <del style={{ ...commonStyle, opacity: 0.6 }}>{node}</del>;
  }
  // 新增样式
  if (leaf.code) {
    node = (
      <code
        style={{
          backgroundColor: "#f3f3f3",
          padding: "0.2em 0.4em",
          borderRadius: "3px",
          fontSize: "0.9em",
        }}
      >
        {node}
      </code>
    );
  }
  if (leaf.subscript) {
    node = <sub>{node}</sub>;
  }
  if (leaf.superscript) {
    node = <sup>{node}</sup>;
  }
  if (leaf.highlight) {
    node = <mark style={{ backgroundColor: "#ffeeba" }}>{node}</mark>;
  }

  return (
    <span {...attributes} className={Object.keys(rest).join(" ")}>
      {node}
    </span>
  );
};

export const renderLeaf = (props) => {
  return <TextLeaf {...props} />;
};
