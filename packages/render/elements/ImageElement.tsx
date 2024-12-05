export const ImageElement = ({ attributes, children, element }) => {
  return (
    <div {...attributes}>
      {children}
      <img
        src={element.url}
        style={{
          display: "block",
          maxWidth: "100%",
          maxHeight: "20em",
        }}
      />
    </div>
  );
};
