import React from "react";
import { Link, useNavigate } from "react-router-dom";

const NoMatch = () => {
  const navigate = useNavigate();

  const goBack = () => {
    navigate(-1);
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <h2 className="mb-8 text-2xl font-semibold md:text-4xl lg:text-6xl">
        Nothing to see here!
      </h2>
      <p className="flex space-x-4 text-base md:text-lg lg:text-xl">
        <Link
          to="/"
          className="flex items-center space-x-4 bg-neutral-300  p-4 text-neutral-700 shadow hover:bg-neutral-400"
        >
          <span>Go to Home</span>
        </Link>
        <button
          onClick={goBack}
          className="flex items-center space-x-4 bg-neutral-200 p-4 text-neutral-700 shadow hover:bg-neutral-300"
        >
          <span>Go Back</span>
        </button>
      </p>
    </div>
  );
};

export default NoMatch;
