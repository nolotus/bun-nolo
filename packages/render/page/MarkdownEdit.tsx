import React, { useEffect, useRef } from 'react';

export const MarkdownEdit = ({ initValue, onChange }) => {
  const [value, setValue] = React.useState(initValue);
  const textareaRef = useRef(null);

  const handleChange = (e) => {
    setValue(e.target.value);
    onChange(e.target.value);
  };
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      // 然后设置为 scrollHeight 来确保所有内容都可见
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [value]); // 依赖 value，确保内容变化时更新高度

  return (
    <textarea
      ref={textareaRef}
      className="w-full h-auto focus:ring-0 focus:outline-none resize-none bg-transparent"
      value={value}
      onChange={handleChange}
    />
  );
};
