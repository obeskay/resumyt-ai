"use client";

import React, { useState, useEffect } from "react";
import { ErrorBoundary } from "react-error-boundary";
import MainLayout from "@/components/MainLayout";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/components/ui/use-toast";
import VideoInput from "@/components/VideoInput";
import { getSupabase } from "@/lib/supabase";
import { Database } from "@/types/supabase";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

type AnonymousUser = Database["public"]["Tables"]["anonymous_users"]["Row"];

interface ClientHomePageProps {
  dict: {
    home: {
      title: string;
      subtitle: string;
      remainingQuota: string;
      inputPlaceholder: string;
      summarizeButton: string;
      error: {
        somethingWentWrong: string;
      };
      dialog: {
        title: string;
        description: string;
        button: string;
      };
    };
  };
}

function ErrorFallback({
  error,
  dict,
}: {
  error: Error;
  dict: ClientHomePageProps["dict"];
}) {
  console.error("Error in HomePage:", error);
  return (
    <div className="container mx-auto">
      <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center">
        {dict.home.error.somethingWentWrong}
      </h1>
      <pre
        className="bg-red-100 border border-red-400 text-red-700 p-4 rounded relative"
        role="alert"
      >
        {error.message}
      </pre>
    </div>
  );
}

const ClientHomePage: React.FC<ClientHomePageProps> = ({ dict }) => {
  const [user, setUser] = useState<AnonymousUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    async function initializeUser(retries = 3) {
      try {
        setLoading(true);

        const response = await fetch("/api/getIp");
        const { ip } = await response.json();

        const supabase = getSupabase();
        const { data: user, error } = await supabase
          .from("anonymous_users")
          .select("*")
          .eq("ip_address", ip)
          .single();

        if (error) {
          if (error.code === "PGRST116") {
            const { data: newUser, error: insertError } = await supabase
              .from("anonymous_users")
              .insert({ ip_address: ip })
              .select()
              .single();

            if (insertError) {
              throw new Error(
                `Failed to create anonymous user: ${insertError.message}`
              );
            }
            setUser(newUser as any);
          } else {
            throw new Error(`Failed to fetch anonymous user: ${error.message}`);
          }
        } else {
          setUser(user as any);
        }

        if (typeof window !== "undefined" && !localStorage.getItem("dialogShown")) {
          setShowDialog(true);
          localStorage.setItem("dialogShown", "true");
        }
      } catch (error) {
        console.error("Error initializing user:", error);
        if (retries > 0) {
          console.log(
            `Retrying user initialization. Attempts left: ${retries - 1}`
          );
          await initializeUser(retries - 1);
        } else {
          toast({
            title: "Error",
            description:
              "Failed to initialize user. Please refresh the page or try again later.",
            variant: "destructive",
          });
        }
      } finally {
        setLoading(false);
      }
    }

    initializeUser();
  }, [toast]);

  return (
    <ErrorBoundary
      FallbackComponent={({ error }) => (
        <ErrorFallback error={error} dict={dict} />
      )}
    >
      <MainLayout>
        <div className="flex-grow flex flex-col justify-center items-center w-full h-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="text-center space-y-6 max-w-lg w-full"
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground">
              {dict.home.title} <br />
              <span className="text-3xl sm:text-4xl md:text-5xl bg-gradient-to-tr from-secondary to-secondary-foreground text-transparent bg-clip-text">
                {dict.home.subtitle}
              </span>
            </h1>
            <AnimatePresence>
              {!loading && user && (
                <motion.div
                  className="space-y-6 w-full"
                  key="user-content"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <VideoInput
                    userId={user.id}
                    isLoading={loading}
                    quotaRemaining={user.quota_remaining}
                    placeholder={dict.home.inputPlaceholder}
                    buttonText={dict.home.summarizeButton}
                  />
                  <p className="text-sm text-foreground/60">
                    {dict.home.remainingQuota}: {user.quota_remaining}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
        <Toaster />
        <AnimatePresence>
          {showDialog && (
            <Dialog open={showDialog} onOpenChange={setShowDialog}>
              <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="text-xl">
                    {dict.home.dialog.title}
                  </DialogTitle>
                  <DialogDescription className="text-sm md:text-base">
                    {dict.home.dialog.description}
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button
                    onClick={() => setShowDialog(false)}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    {dict.home.dialog.button}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </AnimatePresence>
      </MainLayout>
    </ErrorBoundary>
  );
};

export default ClientHomePage;