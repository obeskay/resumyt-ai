import React from "react";

const LoadingIndicator: React.FC = () => (
  <div className="mt-4">
    <div className="w-full bg-muted rounded-full h-2">
      <div
        className="bg-primary h-2 rounded-full animate-pulse"
        style={{ width: "100%" }}
      ></div>
    </div>
    <p className="text-center mt-2 text-sm text-muted-foreground">
      Resumiendo el video...
    </p>
  </div>
);

export default LoadingIndicator;