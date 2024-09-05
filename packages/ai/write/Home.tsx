import React from "react";
import { styles } from "./HomePageStyles";

const HomePage = () => {
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
