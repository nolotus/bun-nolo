// components/BigChart.tsx
import React from "react";

const BigChart: React.FC = () => {
  return (
    <div
      style={{
        width: "100%",
        height: "400px",
        backgroundColor: "#f0f0f0",
        marginTop: "20px",
      }}
    >
      <h2>Big Chart Component</h2>
      <p>
        Imagine this is a complex chart component that takes a while to load.
      </p>
    </div>
  );
};

export default BigChart;
