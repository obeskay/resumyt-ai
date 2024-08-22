import { ErrorBoundary } from 'react-error-boundary';
import HomePage from "./HomePage";

function ErrorFallback({error}: {error: Error}) {
  console.error('Error in HomePage:', error);
  return (
    <div>
      <h1>Something went wrong:</h1>
      <pre>{error.message}</pre>
    </div>
  );
}

export default function Home() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <HomePage />
    </ErrorBoundary>
  );
}
