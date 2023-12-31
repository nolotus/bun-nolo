import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const NoMatch = () => {
  const navigate = useNavigate();

  const goBack = () => {
    navigate(-1);
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <h2 className="text-2xl md:text-4xl lg:text-6xl font-semibold mb-8">
        Nothing to see here!
      </h2>
      <p className="text-base md:text-lg lg:text-xl flex space-x-4">
        <Link
          to="/"
          className="text-neutral-700 bg-neutral-300 hover:bg-neutral-400 p-4  shadow flex items-center space-x-4"
        >
          <span>Go to Home</span>
        </Link>
        <button
          onClick={goBack}
          className="text-neutral-700 bg-neutral-200 hover:bg-neutral-300 p-4 shadow flex items-center space-x-4"
        >
          <span>Go Back</span>
        </button>
      </p>
    </div>
  );
};

export default NoMatch;
