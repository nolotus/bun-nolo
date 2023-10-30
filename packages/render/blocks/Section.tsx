import React, { ReactNode } from 'react';

interface SectionProps {
  title: string;
  children: ReactNode;
}

const Section: React.FC<SectionProps> = ({ title, children }) => {
  return (
    <div className="my-4">
      <h2 className="text-xl font-medium mb-2">{title}</h2>
      <div>{children}</div>
    </div>
  );
};

export default Section;
