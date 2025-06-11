// src/components/common/LoadingSpinner.js

import React from 'react';

/**
 * A simple reusable loading spinner component.
 * @param {Object} props - Component props.
 * @param {string} [props.message="Loading..."] - The message to display below the spinner.
 */
const LoadingSpinner = ({ message = "Loading..." }) => {
  return (
    <div style={{ textAlign: 'center', marginTop: '50px', fontSize: '1.2em', color: '#555' }}>
      {/* This div represents the spinner itself. You'll need CSS to style it. */}
      <div className="spinner"></div> 
      <p>{message}</p>
    </div>
  );
};

export default LoadingSpinner;