import React from "react";

function NotFound() {
  const styles = {
    pageContainer: {
      padding: "20px",
      borderRadius: "5px",
    },
    notFoundContainer: {
      backgroundColor: "#ffe6e6",
      padding: "20px",
      borderRadius: "5px",
    },
    heading: {
      // 你可以在这里添加 h1 的样式
    },
    paragraph: {
      // 你可以在这里添加 p 的样式
    },
  };

  return (
    <div style={styles.notFoundContainer}>
      <h1 style={styles.heading}>404 - Not Found</h1>
      <p style={styles.paragraph}>
        Sorry, the page you are looking for does not exist.
      </p>
    </div>
  );
}

export default NotFound;
