import React from 'react';

const LoadingSpinner: React.FC = () => (
  <>
    <div className="flex items-center justify-center">
      <div
        className="w-5 h-5 mr-2 border-2 border-primary-foreground rounded-full border-r-transparent animate-spin"
        aria-hidden="true"
      ></div>
      <span>Processing...</span>
    </div>
    <span className="sr-only">Processing video, please wait</span>
  </>
);

export default LoadingSpinner;
