import React, { useState } from "react";
import styled from "styled-components";

const PageContainer = styled.div`
  display: flex;
  height: 100vh;
`;

const Sidebar = styled.div`
  width: 200px;
  background-color: #f0f0f0;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const MainContent = styled.div`
  flex-grow: 1;
  padding: 20px;
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const Title = styled.h1`
  font-size: 24px;
  margin: 0;
`;

const Button = styled.button`
  padding: 8px 16px;
  background-color: #f0f0f0;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  &:hover {
    background-color: #e0e0e0;
  }
`;

const AIResponseContainer = styled.div`
  background-color: #f0f0f0;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  flex-grow: 1;
  overflow-y: auto;
`;

const AIMessage = styled.p`
  margin: 0 0 10px 0;
`;

const ThemeOptions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 10px;
`;

const GenerateButton = styled(Button)`
  background-color: #1a73e8;
  color: white;
  &:hover {
    background-color: #1765cc;
  }
`;

const InputContainer = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 20px;
`;

const Input = styled.input`
  flex-grow: 1;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

const SendButton = styled(Button)`
  background-color: #1a73e8;
  color: white;
  &:hover {
    background-color: #1765cc;
  }
`;

const WritingAiPage = () => {
  const [selectedTheme, setSelectedTheme] = useState("");
  const [userInput, setUserInput] = useState("");

  const themes = [
    "Theme",
    "Character",
    "Plot",
    "Conflict",
    "Point of View",
    "Imagine Story",
  ];
  const themeOptions = [
    "Courage",
    "Betrayal and Trust",
    "Justice vs. Revenge",
    "Friendship",
  ];

  const handleThemeClick = (theme) => {
    setSelectedTheme(theme);
  };

  const handleGenerate = () => {
    console.log("Generating with theme:", selectedTheme);
  };

  const handleInputChange = (e) => {
    setUserInput(e.target.value);
  };

  const handleSend = () => {
    console.log("Sending message:", userInput);
    setUserInput("");
  };

  return (
    <PageContainer>
      <Sidebar>
        {themes.map((theme) => (
          <Button key={theme} onClick={() => handleThemeClick(theme)}>
            {theme}
          </Button>
        ))}
        <GenerateButton onClick={handleGenerate}>Generate</GenerateButton>
      </Sidebar>
      <MainContent>
        <Header>
          <Title>Writing AI</Title>
          <Button>Close</Button>
        </Header>
        <AIResponseContainer>
          <AIMessage>
            Start by adding a theme to your story. The theme or moral serves as
            a framework for everything else, so it's a good idea to think of it
            first.
          </AIMessage>
          <AIMessage>
            Sure, here are some theme options that could serve as the foundation
            for a story:
          </AIMessage>
          <ThemeOptions>
            {themeOptions.map((option) => (
              <Button key={option}>{option}</Button>
            ))}
          </ThemeOptions>
        </AIResponseContainer>
        <InputContainer>
          <Input
            value={userInput}
            onChange={handleInputChange}
            placeholder="Type your message here..."
          />
          <SendButton onClick={handleSend}>Send</SendButton>
        </InputContainer>
      </MainContent>
    </PageContainer>
  );
};

export default WritingAiPage;
