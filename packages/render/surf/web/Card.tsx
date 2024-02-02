import React from "react";

interface CardProps {
  children: React.ReactNode;
}

const Card: React.FC<CardProps> & {
  Title: typeof Title;
  Actions: typeof Actions;
} = ({ children }) => (
  <div className="mb-4 rounded-lg bg-white p-4 shadow-md">{children}</div>
);

const Title: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h1 className="border-b-2 border-gray-100 pb-2 text-xl font-bold text-gray-900">
    {children}
  </h1>
);

interface ActionsProps {
  children: React.ReactNode;
}

const Actions: React.FC<ActionsProps> = ({ children }) => (
  <div className="flex items-center">{children}</div>
);

Card.Title = Title;
Card.Actions = Actions;

export default Card;
