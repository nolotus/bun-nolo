// HomePageStyles.ts

import { CSSProperties } from "react";

interface Styles {
  [key: string]: CSSProperties;
}

export const styles: Styles = {
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
