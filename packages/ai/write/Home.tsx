// components/Home.tsx
import React, { useState } from "react";
import withDynamicImport from "utils/withDynamicImport";
import LazyImage from "server/next/components/LazyImage";

const BigChart = withDynamicImport(
  () => import("server/next/components/BigChart"),
  {
    fallback: <div>Loading chart...</div>,
  },
);

const Home: React.FC = () => {
  const [showChart, setShowChart] = useState(false);

  return (
    <div>
      <h1>Welcome Home</h1>
      <p>This is the home page of our application.</p>
      <LazyImage
        src="https://via.placeholder.com/400x300"
        alt="Placeholder Image"
        width={400}
        height={300}
      />
      <button onClick={() => setShowChart(!showChart)}>
        {showChart ? "Hide" : "Show"} Big Chart
      </button>
      {showChart && <BigChart />}
    </div>
  );
};

export default Home;
