// CybotBlock.tsx
import React from "react";
import styled from "styled-components";
import { useCreateDialog } from "chat/dialog/useCreateDialog";
import { Button } from "render/ui";

const CybotCard = styled.div`
  background-color: ${(props) => props.theme.surface1};
  color: ${(props) => props.theme.text1};
  border-radius: 0.75rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  height: 100%;
  transition:
    background-color 0.3s ease,
    color 0.3s ease;
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
`;

const Title = styled.div`
  font-size: 1.25rem;
  font-weight: bold;
  color: ${(props) => props.theme.text1};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const StyledButton = styled(Button)`
  background-color: ${(props) => props.theme.accentColor};
  color: ${(props) => props.theme.surface1};
  font-weight: 600;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  transition:
    background-color 0.2s ease,
    color 0.2s ease;

  &:hover {
    background-color: ${(props) => props.theme.link};
  }
`;

const InfoContainer = styled.div`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
`;

const InfoText = styled.div`
  color: ${(props) => props.theme.text2};
  margin-bottom: 0.75rem;
  display: flex;
  align-items: flex-start;
`;

const Label = styled.span`
  font-weight: 600;
  min-width: 70px;
  margin-right: 0.5rem;
  color: ${(props) => props.theme.text1};
`;

const ModelName = styled.span`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Introduction = styled.span`
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

interface CybotBlockProps {
  item: {
    id: string;
    name: string;
    model: string;
    introduction: string;
  };
}

const CybotBlock: React.FC<CybotBlockProps> = ({ item }) => {
  const { isLoading, createDialog } = useCreateDialog();
  const createNewDialog = async () => {
    try {
      const cybotId = item.id;
      await createDialog({ cybots: [cybotId] });
    } catch (error) {
      // 错误处理
    }
  };

  return (
    <CybotCard>
      <CardHeader>
        <Title title={item.name}>{item.name}</Title>
        <StyledButton loading={isLoading} onClick={createNewDialog}>
          对话
        </StyledButton>
      </CardHeader>
      <InfoContainer>
        <InfoText>
          <Label>模型名：</Label>
          <ModelName title={item.model}>{item.model}</ModelName>
        </InfoText>
        <InfoText>
          <Label>介绍：</Label>
          <Introduction>{item.introduction}</Introduction>
        </InfoText>
      </InfoContainer>
    </CybotCard>
  );
};

export default CybotBlock;
