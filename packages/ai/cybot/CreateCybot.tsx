import React from "react";
import { useForm } from "react-hook-form";

const CreateCybot = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = (data) => {
    console.log(data);
    // Here you would typically send the data to your backend
  };

  const formStyle = {
    maxWidth: "500px",
    margin: "0 auto",
    padding: "20px",
  };

  const inputStyle = {
    width: "100%",
    padding: "8px",
    margin: "8px 0",
    borderRadius: "4px",
    border: "1px solid #ddd",
  };

  const labelStyle = {
    fontWeight: "bold",
    marginBottom: "5px",
    display: "block",
  };

  const buttonStyle = {
    backgroundColor: "#4CAF50",
    border: "none",
    color: "white",
    padding: "12px 24px",
    textAlign: "center",
    textDecoration: "none",
    display: "inline-block",
    fontSize: "16px",
    margin: "4px 2px",
    cursor: "pointer",
    borderRadius: "4px",
  };

  const errorStyle = {
    color: "red",
    fontSize: "0.8em",
  };

  return (
    <div style={formStyle}>
      <h2 style={{ textAlign: "center", color: "#333" }}>Create a New Cybot</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label htmlFor="name" style={labelStyle}>
            Cybot Name:
          </label>
          <input
            id="name"
            style={inputStyle}
            {...register("name", { required: "Cybot name is required" })}
          />
          {errors.name && <p style={errorStyle}>{errors.name.message}</p>}
        </div>

        <div>
          <label htmlFor="greeting" style={labelStyle}>
            Greeting Message:
          </label>
          <input
            id="greeting"
            style={inputStyle}
            {...register("greeting", {
              required: "Greeting message is required",
            })}
          />
          {errors.greeting && (
            <p style={errorStyle}>{errors.greeting.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="introduction" style={labelStyle}>
            Self Introduction:
          </label>
          <textarea
            id="introduction"
            style={{ ...inputStyle, height: "100px" }}
            {...register("introduction", {
              required: "Self introduction is required",
            })}
          />
          {errors.introduction && (
            <p style={errorStyle}>{errors.introduction.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="model" style={labelStyle}>
            Model:
          </label>
          <select
            id="model"
            style={inputStyle}
            {...register("model", { required: "Model selection is required" })}
          >
            <option value="">Select a model</option>
            <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
            <option value="gpt-4">GPT-4</option>
          </select>
          {errors.model && <p style={errorStyle}>{errors.model.message}</p>}
        </div>

        <div>
          <label htmlFor="prompt" style={labelStyle}>
            Prompt:
          </label>
          <textarea
            id="prompt"
            style={{ ...inputStyle, height: "100px" }}
            {...register("prompt", { required: "Prompt is required" })}
          />
          {errors.prompt && <p style={errorStyle}>{errors.prompt.message}</p>}
        </div>

        <button type="submit" style={buttonStyle}>
          Create Cybot
        </button>
      </form>
    </div>
  );
};

export default CreateCybot;
