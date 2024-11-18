// MoodNoteInput.js
import React, { useState } from "react";
import { HiOutlineCamera } from "react-icons/hi";
import { TbMoodCheck } from "react-icons/tb";

interface MoodNoteInputProps {
  onSend: (content: string, images: string[]) => void;
}

const RecordButton = ({ handleSend, style }) => {
  return (
    <button
      onClick={handleSend}
      style={{
        width: '35px',
        height: '35px',
        backgroundColor: '#7AB892',
        color: '#fff',
        border: 'none',
        borderRadius: '50%',
        cursor: 'pointer',
        fontSize: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 2px 8px rgba(122, 184, 146, 0.2)',
        transition: 'all 0.3s ease',
        ...style,
      }}
    >
      <TbMoodCheck size={20} />
    </button>
  );
};

const ChooseimgButton = ({ handleImageUpload }) => {
  return (
    <label
      style={{
        width: "35px",
        height: "35px",
        backgroundColor: "#7AB892",
        color: "#fff",
        border: "none",
        borderRadius: "50%",
        cursor: "pointer",
        fontSize: "20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 2px 8px rgba(122, 184, 146, 0.2)",
        transition: "all 0.3s ease",
      }}
    >
      <input
        type="file"
        accept="image/*"
        multiple
        onChange={handleImageUpload}
        style={{
          display: "none",
        }}
      />
      <HiOutlineCamera size={20} />
    </label>
  );
};

const MoodNoteInput: React.FC<MoodNoteInputProps> = ({ onSend }) => {
  const [content, setContent] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [imagePreview, setImagePreview] = useState<string>("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setContent(e.target.value);
  };

  const handleSend = () => {
    onSend(content, images);
    setContent("");
    setImages([]);
    setImagePreview("");
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    const promises = [];

    for (let i = 0; i < files.length; i++) {
      promises.push(
        new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => {
            const base64String = reader.result as string;
            resolve(base64String);
          };
          reader.readAsDataURL(files[i]);
        })
      );
    }

    Promise.all(promises).then((images) => {
      setImages(images);
      setImagePreview(images[0]);
    });
  };

  return (
    <div
      style={{
        display: "flex",
        gap: "15px",
        marginBottom: 20,
        alignItems: "center",
      }}
    >
      <div
        style={{
          position: "relative",
          flex: 1,
        }}
      >
        <input
          type="text"
          value={content}
          onChange={handleInputChange}
          placeholder="Hi, how's your day?"
          style={{
            height: "45px",
            padding: "0 20px",
            fontSize: "16px",
            border: "2px solid #7AB892",
            borderRadius: "25px",
            backgroundColor: "#F8FBF9",
            boxShadow: "0 2px 8px rgba(122, 184, 146, 0.1)",
            outline: "none",
            transition: "all 0.3s ease",
            width: "100%",
            paddingRight: "60px",
          }}
        />
        <RecordButton
          handleSend={handleSend}
          style={{
            position: "absolute",
            right: "10px",
            top: "50%",
            transform: "translateY(-50%)",
          }}
        />
      </div>

      {imagePreview && (
        <div
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "4px",
            overflow: "hidden",
            marginRight: "10px",
          }}
        >
          <img
            src={imagePreview}
            alt="图片预览"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        </div>
      )}

      <div
        style={{
          display: "flex",
          gap: "10px",
        }}
      >
        <ChooseimgButton handleImageUpload={handleImageUpload} />
      </div>
    </div>
  );
};

export default MoodNoteInput;