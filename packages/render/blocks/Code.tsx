import { CheckIcon, CopyIcon } from '@primer/octicons-react';
import clsx from 'clsx';
import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
// Import the new style you want to use
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/prism';

const Code = ({ value, language }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    if (value && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(value);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      } catch (err) {
        console.error('无法复制:', err);
      }
    }
  };

  return (
    <div className="relative my-6 mx-auto overflow-hidden rounded-lg shadow-md bg-gray-800 text-gray-100">
      <div className="flex items-center justify-between px-4 py-2 bg-gradient-to-r from-blue-500 to-teal-600">
        <span className="text-sm font-medium">
          {language?.toUpperCase() || 'CODE'}
        </span>
        <button
          onClick={handleCopy}
          className={clsx(
            'p-2 rounded transition-all duration-200 ease-in-out',
            isCopied
              ? 'text-green-400 bg-gray-700'
              : 'text-gray-200 hover:bg-gray-700',
          )}
          disabled={!value}
          aria-label="复制代码"
        >
          {isCopied ? <CheckIcon size={16} /> : <CopyIcon size={16} />}
        </button>
      </div>

      <SyntaxHighlighter
        language={language || 'jsx'}
        style={dracula}
        customStyle={{ background: 'transparent', padding: '1em', margin: '0' }}
      >
        {value}
      </SyntaxHighlighter>
    </div>
  );
};

export default Code;
