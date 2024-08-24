export const handleError = (error: unknown, toast: (props: any) => void) => {
  let errorMessage = "An unexpected error occurred. Please try again.";
  if (error instanceof Error) {
    errorMessage = error.message;
  }
  toast({
    title: "Error",
    description: errorMessage,
    variant: "destructive",
  });
};
