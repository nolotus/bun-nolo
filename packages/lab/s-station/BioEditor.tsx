import React, { useState } from "react";
import { GiCheckMark } from "react-icons/gi";
import { ImLeaf } from "react-icons/im";

const BioEditor = () => {
  const [bio, setBio] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    setIsEditing(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setBio(e.target.value);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        marginBottom: 20,
      }}
    >
      {isEditing ? (
        <textarea
          value={bio}
          onChange={handleChange}
          style={{
            width: "100%",
            height: "90px",
            padding: "10px",
            fontSize: "16px",
            border: "2px solid #7AB892",
            borderRadius: "25px",
            backgroundColor: "#F8FBF9",
            boxShadow: "0 2px 8px rgba(122, 184, 146, 0.1)",
            outline: "none",
            transition: "all 0.3s ease",
          }}
        />
      ) : (
        <p
          style={{
            fontSize: "16px",
            fontStyle: "italic",
            textAlign: "center",
            marginBottom: 10,
          }}
        >
          {bio}
        </p>
      )}
      {isEditing ? (
        <button
          onClick={handleSave}
          style={{
            width: "100px",
            height: "35px",
            backgroundColor: "transparent",
            border: "none",
            borderRadius: "25px",
            cursor: "pointer",
            fontSize: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "none",
            transition: "all 0.3s ease",
          }}
        >
          <GiCheckMark style={{ color: "#7AB892" }} />
        </button>
      ) : (
        <button
          onClick={handleEdit}
          style={{
            width: "50px",
            height: "35px",
            backgroundColor: "transparent", // 透明背景
            border: "none",
            borderRadius: "25px",
            cursor: "pointer",
            fontSize: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "none", // 去掉阴影
            transition: "all 0.3s ease",
          }}
        >
          <ImLeaf style={{ color: "#7AB892" }} />
        </button>
      )}
    </div>
  );
};

export default BioEditor;
