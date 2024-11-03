import React from "react";

interface ErrorFallbackProps {
  error: Error;
  dict: any;
}

export const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  dict,
}) => (
  <div className="container mx-auto p-4">
    <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center text-red-600">
      {dict.home?.error?.somethingWentWrong ?? "Something went wrong"}
    </h1>
    <pre className="bg-red-100 border border-red-400 text-red-700 p-4 rounded-lg overflow-auto">
      {error.message}
    </pre>
  </div>
);
