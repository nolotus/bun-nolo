import debounce from 'lodash.debounce';
import React, { useEffect, useRef, useState, ChangeEvent } from 'react';

type MarkdownEditProps = {
  initValue: string,
  onChange: (value: string) => void,
};

// 更新TextArea高度的函数，应用了debounce来减少更新频率
const updateTextAreaHeight = debounce((textarea: HTMLTextAreaElement) => {
  requestAnimationFrame(() => {
    textarea.style.height = 'auto'; // 设置高度为auto以获取正确的scrollHeight
    textarea.style.height = `${textarea.scrollHeight}px`;
  });
}, 300); // 调整时间间隔为300毫秒，可以根据实际情况调整

export const MarkdownEdit: React.FC<MarkdownEditProps> = ({
  initValue,
  onChange,
}) => {
  const [value, setValue] = useState<string>(initValue);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = event.target.value;
    setValue(newValue);
    onChange(newValue);
  };

  useEffect(() => {
    const textarea = textareaRef.current;
    // 仅当textarea存在时更新其高度
    if (textarea) {
      updateTextAreaHeight(textarea); // 调用更新高度的函数
    }
  }, [value]); // 依赖列表中的value变化时触发更新高度

  useEffect(() => {
    // 确保组件销毁时取消所有未执行的updateTextAreaHeight操作
    return () => {
      updateTextAreaHeight.cancel();
    };
  }, []);

  return (
    <textarea
      ref={textareaRef}
      className="w-full h-auto focus:ring-0 focus:outline-none resize-none bg-transparent"
      value={value}
      onChange={handleChange}
    />
  );
};
