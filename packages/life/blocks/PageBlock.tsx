import React from 'react';
import { Link } from 'react-router-dom';

export const PageBlock = ({ value, id }) => (
  <div className="flex flex-col justify-between h-full p-4">
    <div>
      <h3 className="font-semibold text-lg mb-2">
        <Link
          to={`/${id}`}
          className="text-black hover:text-sky-500 transition-colors duration-150 ease-snappy"
        >
          {value.title}
        </Link>
      </h3>
      <p className="text-neutral-600 text-sm">{value.content}</p>
    </div>
    <div className="mt-4">
      <Link
        to={`/${id}`}
        className="text-white bg-sky-500 hover:bg-sky-600 transition-colors duration-150 ease-snappy py-2 px-4 rounded text-sm font-medium"
      >
        查看更多
      </Link>
    </div>
  </div>
);
