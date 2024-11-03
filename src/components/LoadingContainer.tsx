import { motion } from "framer-motion";
import { Icons } from "@/components/ui/icons";

interface LoadingContainerProps {
  dict?: any;
  message?: string;
}

export default function LoadingContainer({
  dict,
  message,
}: LoadingContainerProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex flex-col items-center justify-center"
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      >
        <Icons.spinner className="h-8 w-8 text-primary" />
      </motion.div>
      <p className="mt-4 text-muted-foreground">
        {message || dict?.common?.loading || "Loading..."}
      </p>
    </motion.div>
  );
}
