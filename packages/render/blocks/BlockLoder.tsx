import React from "react";
import "./blockloader.css";

export const BlockLoader = ({ type = "typing_loader" }) => {
  const renderLoader = () => {
    switch (type) {
      case "timer":
        return <div className="timer"></div>;
      case "typing_loader":
        return <div className="typing_loader"></div>;
      case "location_indicator":
        return <div className="location_indicator"></div>;
      case "dashboard":
        return <div className="dashboard"></div>;
      case "battery":
        return <div className="battery"></div>;
      case "magnifier":
        return <div className="magnifier"></div>;
      case "help":
        return <div className="help"></div>;
      case "cloud":
        return <div className="cloud"></div>;
      case "eye":
        return <div className="eye"></div>;
      case "coffee_cup":
        return <div className="coffee_cup"></div>;
      case "square":
        return <div className="square"></div>;
      case "circle":
        return <div className="circle"></div>;
      default:
        return <div>Invalid type</div>;
    }
  };

  return (
    <div className="wrapper">
      <div className="span">{renderLoader()}</div>
    </div>
  );
};
