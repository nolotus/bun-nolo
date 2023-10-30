import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

function copyToClipboard(text) {
  var tempInput = document.createElement('textarea');
  tempInput.style = 'position: absolute; left: -1000px; top: -1000px';
  tempInput.value = text;
  document.body.appendChild(tempInput);
  tempInput.select();
  document.execCommand('copy');
  document.body.removeChild(tempInput);
}

const Code = ({ value, language }) => {
  // 自定义样式
  const customStyle = {
    ...vscDarkPlus,
    'code[class*="language-"]': {
      ...vscDarkPlus['code[class*="language-"]'],
      fontFamily: "'Courier New', monospace",
      fontSize: '16px',
    },
  };

  return (
    <div className="relative my-8 overflow-auto">
      <button
        className="absolute top-2 right-2 text-white bg-blue-500 p-1 rounded hover:bg-blue-700 cursor-pointer"
        onClick={() => copyToClipboard(value)}
      >
        Copy
      </button>
      <SyntaxHighlighter language={language || 'jsx'} style={customStyle}>
        {value}
      </SyntaxHighlighter>
    </div>
  );
};

export default Code;
