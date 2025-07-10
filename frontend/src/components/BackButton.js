import React from "react";
import { useNavigate } from "react-router-dom";

const BackButton = ({ to = "/" }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(to);
  };

  return (
    <button
      onClick={handleBack}
      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
    >
      ← Back
    </button>
  );
};

export default BackButton;
