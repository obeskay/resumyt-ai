"use client";

import { useState, useEffect } from "react";
import HomePage from "./HomePage";
import { ErrorBoundary } from "react-error-boundary";

function ErrorFallback({ error }: { error: Error }) {
  return (
    <div role="alert">
      <p>Something went wrong:</p>
      <pre>{error.message}</pre>
    </div>
  );
}

export default function Home() {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (hasError) {
      // Log the error or send it to an error tracking service
      console.error("An error occurred in the HomePage component");
    }
  }, [hasError]);

  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={() => setHasError(true)}
    >
      <HomePage />
    </ErrorBoundary>
  );
}
