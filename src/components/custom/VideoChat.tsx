import React, { useRef, useEffect, useState, useCallback } from "react";
import { useChat } from "ai/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import { ScrollArea } from "../ui/scroll-area";
import ReactMarkdown from "react-markdown";
import { getSupabase } from "@/lib/supabase";
import { MessageCircle, Sparkles, ChevronDown } from "lucide-react";
import ShineBorder from "@/components/ui/shine-border";
import { Dictionary } from "@/types/dictionary";

interface VideoChatProps {
  videoId: string;
  videoTitle: string;
  language: "es" | "en";
  dict: Dictionary;
}

const VideoChat: React.FC<VideoChatProps> = ({
  videoId,
  videoTitle,
  language,
  dict,
}) => {
  const { theme } = useTheme();
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(true);
  const [showSuggestedQuestions, setShowSuggestedQuestions] = useState(true);
  const [isChatExpanded, setIsChatExpanded] = useState(true);

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
    setInput,
  } = useChat({
    api: "/api/chat",
    body: { videoId, language },
  });

  const loadOrGenerateSuggestedQuestions = useCallback(async () => {
    setIsLoadingSuggestions(true);
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from("summaries")
        .select("suggested_questions")
        .eq("video_id", videoId)
        .single();

      if (error) throw error;

      if (data?.suggested_questions?.length > 0) {
        setSuggestedQuestions(data.suggested_questions);
      } else {
        const response = await fetch("/api/generate-questions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            videoId,
            language,
            count: 5,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error("Error details:", errorData);
          throw new Error(errorData.error || "Failed to generate questions");
        }

        const { questions } = await response.json();

        // Extraer solo el texto de las preguntas
        const questionTexts = questions.map((q: any) => q.question);

        if (!questionTexts || questionTexts.length === 0) {
          throw new Error("No questions were received");
        }

        setSuggestedQuestions(questionTexts);

        // Guardar en Supabase
        await supabase
          .from("summaries")
          .update({ suggested_questions: questionTexts })
          .eq("video_id", videoId);
      }
    } catch (error) {
      console.error("Error loading questions:", error);
      setSuggestedQuestions([]);
    } finally {
      setIsLoadingSuggestions(false);
    }
  }, [videoId, language]);

  useEffect(() => {
    loadOrGenerateSuggestedQuestions();
  }, [loadOrGenerateSuggestedQuestions]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages, suggestedQuestions]);

  const handleSuggestedQuestion = (question: string) => {
    setInput(question);
    setShowSuggestedQuestions(false);
    handleSubmit(new Event("submit") as any);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8 max-w-full"
    >
      <ShineBorder
        className="rounded-lg p-2 shadow-lg mx-auto relative"
        color={["hsl(var(--secondary))", "hsl(var(--secondary-foreground))"]}
      >
        <div className="flex items-center space-x-1 pb-2">
          <MessageCircle className="w-4 h-4 text-secondary" />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex items-center space-x-1"
          >
            <Sparkles className="w-3 h-3 text-secondary" />
            <span className="text-base font-medium text-secondary">
              {dict.home.videoChat.newChatAvailable}
            </span>
          </motion.div>
        </div>
        <motion.div
          animate={{ y: [0, 5, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="absolute bottom-2 left-1/2 transform -translate-x-1/2"
        >
          <ChevronDown className="w-3 h-3" />
        </motion.div>
      </ShineBorder>

      <motion.div
        initial={{ opacity: 1, height: "auto" }}
        animate={{ opacity: 1, height: "auto" }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        <ScrollArea
          ref={chatContainerRef}
          className="border rounded-lg p-2 h-[calc(100vh-300px)] max-h-96 overflow-y-auto bg-gradient-to-b from-background to-background/50 backdrop-blur-sm"
        >
          <div className="max-w-full space-y-2">
            <AnimatePresence initial={false}>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className={`mb-2 ${message.role === "user" ? "flex justify-end" : "flex justify-start"}`}
                >
                  <div
                    className={`p-2 rounded-lg ${message.role === "user" ? "bg-primary/20" : "bg-secondary/10 text-foreground dark:bg-secondary/10 dark:text-secondary-foreground"} shadow-3xl max-w-[85%]`}
                  >
                    <ReactMarkdown
                      components={{
                        ul: ({ node, ...props }) => (
                          <ul className="list-disc pl-4" {...props} />
                        ),
                        ol: ({ node, ...props }) => (
                          <ol className="list-decimal pl-4" {...props} />
                        ),
                        p: ({ node, ...props }) => (
                          <p
                            className="whitespace-pre-wrap break-words"
                            {...props}
                          />
                        ),
                        code: ({ node, ...props }) => (
                          <code
                            className={`block-code break-words`}
                            {...props}
                          />
                        ),
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {isLoadingSuggestions && showSuggestedQuestions ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center"
              >
                <p className="text-gray-500 mb-4">
                  {dict.home.videoChat.generatingQuestions}
                </p>
                <Skeleton className="h-8 w-3/4 mx-auto bg-primary/20" />
              </motion.div>
            ) : suggestedQuestions.length > 0 && showSuggestedQuestions ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-4 space-y-2 w-full"
              >
                <p className="text-lg text-center font-semibold py-4">
                  {dict.home.videoChat.suggestedQuestions}
                </p>
                <div className="flex flex-col gap-3">
                  {suggestedQuestions.map((question, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => handleSuggestedQuestion(question)}
                      className="text-sm font-medium py-3  whitespace-normal text-left h-auto"
                    >
                      <span className="line-clamp-2 mr-auto">{question}</span>
                    </Button>
                  ))}
                </div>
              </motion.div>
            ) : null}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center"
              >
                <Skeleton className="h-4 w-3/4 mx-auto bg-primary/20" />
              </motion.div>
            )}
            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-red-500 text-center bg-red-100 dark:bg-red-900 p-2 rounded-lg"
              >
                {dict.home.videoChat.error}{" "}
                {error?.toString() || "Algo salió mal"}
              </motion.div>
            )}
          </div>
        </ScrollArea>
        <form onSubmit={handleSubmit} className="flex space-x-2 mt-2">
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder={dict.home.videoChat.inputPlaceholder}
            className="flex-grow bg-background/50 backdrop-blur-sm text-sm"
            disabled={isLoading}
          />
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-primary hover:bg-primary/80 text-primary-foreground transition-colors duration-200 whitespace-nowrap text-sm px-3 py-1"
          >
            {isLoading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full"
              />
            ) : (
              dict.home.videoChat.sendButton
            )}
          </Button>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default VideoChat;
