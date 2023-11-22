import { CopyIcon } from '@primer/octicons-react';
import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const Code = ({ value, language }) => {
  // 优化复制按钮样式，考虑不同尺寸的对应样式
  const copyButtonStyles = `
    absolute right-2 top-2 text-white bg-sky-500 p-1 rounded 
    shadow transition-colors duration-150 ease-snappy hover:bg-sky-600 
    disabled:opacity-50 focus:outline-none focus:ring focus:ring-sky-300 
    sm:right-3 sm:top-3 sm:p-2
    lg:right-4 lg:top-4 lg:p-2.5
    2xl:right-5 2xl:top-5 2xl:p-3
  `;

  // SyntaxHighlighter的自定义样式，适应屏幕尺寸变化，略微增大最大宽度
  const customStyle = {
    ...vscDarkPlus,
    borderRadius: '0.25em',
    margin: '0.5em',
    padding: '0.5em',
    overflow: 'auto',
    backgroundColor: 'rgb(55, 65, 81)', // 更新为Neutral灰色颜色系
    '@media(min-width: 640px)': {
      borderRadius: '0.5em',
      margin: '1em',
      padding: '1em',
    },
    '@media(min-width: 1024px)': {
      borderRadius: '0.5em',
      margin: '1em',
      padding: '1.5em',
    },
    '@media(min-width: 1536px)': {
      borderRadius: '0.5em',
      margin: '1em',
      padding: '2em',
    },
  };

  const handleCopy = async (text) => {
    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(text);
        // 提供用户反馈，例如弹窗或更改按钮文本提示用户已复制
      } catch (err) {
        // 错误处理，例如通知用户复制失败
      }
    } else {
      // 兼容性处理，如使用老式的复制方法
    }
  };

  return (
    <div className="relative my-4 mx-auto max-w-xl sm:max-w-2xl md:max-w-4xl lg:max-w-5xl 2xl:max-w-7xl overflow-hidden rounded shadow">
      <button
        className={copyButtonStyles}
        onClick={() => handleCopy(value)}
        aria-label="复制代码"
      >
        <CopyIcon size={16} className="sm:size-18 lg:size-20 2xl:size-24" />
      </button>
      <SyntaxHighlighter language={language || 'jsx'} style={customStyle}>
        {value}
      </SyntaxHighlighter>
    </div>
  );
};

export default Code;
