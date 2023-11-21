import { CopyIcon } from '@primer/octicons-react';
import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const Code = ({ value, language }) => {
  const copyButtonStyles =
    'absolute right-2 top-2 text-white bg-sky-500 p-1 rounded transition-colors duration-150 ease-snappy hover:bg-sky-600 disabled:opacity-50';

  // 自定义SyntaxHighlighter的样式，适配不同屏幕尺寸
  const customStyle = {
    ...vscDarkPlus,
    'code[class*="language-"]': {
      ...vscDarkPlus['code[class*="language-"]'],
      fontFamily: "'Courier New', monospace",
      fontSize: '14px', // 默认字体大小调整为14px
      '@media(min-width: 640px)': {
        fontSize: '15px', // sm
      },
      '@media(min-width: 768px)': {
        fontSize: '16px', // md
      },
      '@media(min-width: 1024px)': {
        fontSize: '17px', // lg
      },
      '@media(min-width: 1280px)': {
        fontSize: '18px', // xl
      },
      '@media(min-width: 1536px)': {
        fontSize: '19px', // 2xl
      },
    },
    'pre[class*="language-"]': {
      ...vscDarkPlus['pre[class*="language-"]'],
      padding: '1em',
      margin: '1em 0',
      borderRadius: '0.5em',
      border: 'solid 1px rgba(255, 255, 255, 0.15)',
      overflow: 'auto',
      '@media(min-width: 640px)': {
        margin: '1.5em 0',
      },
      '@media(min-width: 768px)': {
        margin: '2em 0',
      },
      '@media(min-width: 1024px)': {
        margin: '2.5em 0',
      },
      '@media(min-width: 1280px)': {
        margin: '3em 0',
      },
      '@media(min-width: 1536px)': {
        margin: '3.5em 0',
      },
    },
  };

  const copyToClipboard = (text) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        console.log('Text copied to clipboard');
      })
      .catch((err) => {
        console.error('Failed to copy text to clipboard', err);
      });
  };

  return (
    <div className="relative my-8 overflow-hidden rounded-md bg-neutral-800 mx-auto max-w-full sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl 2xl:max-w-2xl">
      <button
        className={copyButtonStyles}
        onClick={() => copyToClipboard(value)}
        aria-label="复制代码"
      >
        <CopyIcon size={16} />
      </button>
      <SyntaxHighlighter language={language || 'jsx'} style={customStyle}>
        {value}
      </SyntaxHighlighter>
    </div>
  );
};

export default Code;
