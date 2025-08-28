import React from "react";
import { DotPulse } from "ldrs/react";
import "ldrs/react/DotPulse.css";

const Loader = ({
  loading,
  className = "loaderWrapper",
  size = "40",
  color = "white",
  speed = "1.3",
}) => {
  return (
    loading && (
      <div className={className}>
        <DotPulse size={size} speed={speed} color={color} />
      </div>
    )
  );
};

export default Loader;