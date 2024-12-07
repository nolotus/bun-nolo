import React from "react";
import { Link, useNavigate } from "react-router-dom";

const NoMatch = () => {
  const navigate = useNavigate();

  const buttonStyle = {
    padding: "16px",
    backgroundColor: "#f0f0f0",
    color: "#333",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    margin: "0 8px",
    transition: "all 0.2s",
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        backgroundColor: "#fafafa",
      }}
    >
      <h2
        style={{
          fontSize: "3rem",
          marginBottom: "2rem",
          color: "#2d3748",
        }}
      >
        Nothing to see here!
      </h2>
      <div>
        <Link to="/" style={buttonStyle}>
          Go to Home
        </Link>
        <button onClick={() => navigate(-1)} style={buttonStyle}>
          Go Back
        </button>
      </div>
    </div>
  );
};

export default NoMatch;
