import React from "react";

const HomePage = () => {
  const styles = {
    container: {
      display: "flex",
      fontFamily: "Arial, sans-serif",
      backgroundColor: "#f0f2f5",
      padding: "20px",
    },
    sidebar: {
      width: "200px",
      marginRight: "20px",
    },
    mainContent: {
      flex: 1,
    },
    button: {
      display: "flex",
      alignItems: "center",
      backgroundColor: "white",
      border: "none",
      borderRadius: "20px",
      padding: "10px 15px",
      marginBottom: "10px",
      cursor: "pointer",
      width: "100%",
    },
    buttonIcon: {
      marginRight: "10px",
    },
    tagContainer: {
      display: "flex",
      marginBottom: "20px",
    },
    tag: {
      backgroundColor: "#e4e6eb",
      borderRadius: "15px",
      padding: "5px 10px",
      marginRight: "10px",
      fontSize: "14px",
    },
    post: {
      backgroundColor: "white",
      borderRadius: "10px",
      padding: "20px",
      marginBottom: "20px",
    },
    postHeader: {
      display: "flex",
      alignItems: "center",
      marginBottom: "10px",
    },
    avatar: {
      width: "40px",
      height: "40px",
      borderRadius: "50%",
      marginRight: "10px",
    },
    postContent: {
      fontSize: "14px",
      lineHeight: "1.4",
    },
    imageContainer: {
      display: "flex",
      justifyContent: "space-between",
      marginTop: "15px",
    },
    image: {
      width: "32%",
      borderRadius: "10px",
    },
    postFooter: {
      display: "flex",
      alignItems: "center",
      marginTop: "15px",
      color: "#65676b",
      fontSize: "14px",
    },
    footerItem: {
      marginRight: "20px",
    },
    inputContainer: {
      display: "flex",
      alignItems: "center",
      backgroundColor: "white",
      borderRadius: "20px",
      padding: "10px 15px",
    },
    input: {
      flex: 1,
      border: "none",
      outline: "none",
      fontSize: "14px",
    },
    sendButton: {
      backgroundColor: "#8e44ad",
      color: "white",
      border: "none",
      borderRadius: "50%",
      width: "30px",
      height: "30px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.sidebar}>
        <button style={styles.button}>
          <span style={styles.buttonIcon}>🔍</span> Explore
        </button>
        <button style={styles.button}>
          <span style={styles.buttonIcon}>📝</span> My Posts
        </button>
        <button style={styles.button}>
          <span style={styles.buttonIcon}>❤️</span> My Likes
        </button>
      </div>
      <div style={styles.mainContent}>
        <div style={styles.tagContainer}>
          <span style={styles.tag}>light novel</span>
          <span style={styles.tag}>manga</span>
          <span style={styles.tag}>movies</span>
        </div>
        <div style={styles.post}>
          <div style={styles.postHeader}>
            <img
              src="https://via.placeholder.com/40"
              alt="Avatar"
              style={styles.avatar}
            />
            <div>John Doe • 3 hr</div>
          </div>
          <div style={styles.postContent}>
            The ending of Game of Thrones sparked a lot of debate, with many
            fans having mixed reactions. The final season (Season 8) wrapped up
            the storylines of various characters, though not always in ways that
            fans expected. Destroyed: In a symbolic moment, Drogon, Daenerys'
            dragon, melts the Iron Throne with dragon fire after Daenerys'
            death, ending the cycle of power struggles for the throne. After
            Daenerys' fall, the lords of Westeros look to Sansa Stark to lead...
          </div>
          <div style={styles.imageContainer}>
            <img
              src="https://via.placeholder.com/200x150"
              alt="GOT 1"
              style={styles.image}
            />
            <img
              src="https://via.placeholder.com/200x150"
              alt="GOT 2"
              style={styles.image}
            />
            <img
              src="https://via.placeholder.com/200x150"
              alt="GOT 3"
              style={styles.image}
            />
          </div>
          <div style={styles.postFooter}>
            <span style={styles.footerItem}>💬 30 Comments</span>
            <span style={styles.footerItem}>❤️ 123 likes</span>
          </div>
        </div>
        <div style={styles.inputContainer}>
          <input style={styles.input} placeholder="Share your story here" />
          <button style={styles.sendButton}>➤</button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
