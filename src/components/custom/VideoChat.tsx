import React, { useRef, useEffect, useState } from "react";
import { useChat } from "ai/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import { ScrollArea } from "../ui/scroll-area";
import ReactMarkdown from "react-markdown";

interface VideoChatProps {
  videoId: string;
  videoTitle: string;
  language: "es" | "en";
}

const VideoChat: React.FC<VideoChatProps> = ({
  videoId,
  videoTitle,
  language,
}) => {
  const { theme } = useTheme();
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(true);

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
    setInput,
  } = useChat({
    api: "/api/chat-with-video",
    body: { videoId, language },
  });

  useEffect(() => {
    const loadSuggestedQuestions = async () => {
      try {
        const response = await fetch("/api/chat-with-video", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ videoId, language, messages: [] }),
        });
        const data = await response.json();
        if (Array.isArray(data.suggestedQuestions)) {
          setSuggestedQuestions(data.suggestedQuestions);
        }
      } catch (error) {
        console.error("Error loading suggested questions:", error);
      } finally {
        setIsLoadingSuggestions(false);
      }
    };

    loadSuggestedQuestions();
  }, [videoId, language]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages, suggestedQuestions]);

  const handleSuggestedQuestion = (question: string) => {
    setInput(question);
    handleSubmit(new Event("submit") as any);
    setSuggestedQuestions([]);
  };

  return (
    <div className="space-y-4 max-w-full">
      <h2 className="text-2xl font-bold break-words">
        {language === "es" ? "Chat sobre" : "Chat about"} &quot;{videoTitle}
        &quot;
      </h2>
      <ScrollArea
        ref={chatContainerRef}
        className="border rounded-lg p-4 h-96 overflow-y-auto bg-gradient-to-b from-background to-background/50 backdrop-blur-sm"
      >
        <div className="max-w-full">
          <AnimatePresence initial={false}>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className={`mb-4 ${
                  message.role === "user"
                    ? "flex justify-end"
                    : "flex justify-start"
                }`}
              >
                <div
                  className={`p-3 rounded-lg ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary/10 text-foreground dark:bg-secondary/10 dark:text-secondary-foreground"
                  } shadow-md max-w-[75%]`}
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
                      code: ({ node, inline, ...props }) => (
                        <code
                          className={`${inline ? "inline-code" : "block-code"} break-words`}
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
          {isLoadingSuggestions ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center"
            >
              <Skeleton className="h-8 w-3/4 mx-auto bg-primary/20" />
            </motion.div>
          ) : (
            suggestedQuestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 space-y-4 w-full"
              >
                <p className="text-lg font-semibold text-center text-primary">
                  {language === "es"
                    ? "Preguntas sugeridas:"
                    : "Suggested questions:"}
                </p>
                <div className="flex flex-col gap-3">
                  {suggestedQuestions.map((question, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="lg"
                      onClick={() => handleSuggestedQuestion(question)}
                      className="text-lg font-medium py-6 hover:bg-primary hover:text-primary-foreground transition-all duration-300 whitespace-normal text-left h-auto"
                    >
                      <span className="line-clamp-2">{question}</span>
                    </Button>
                  ))}
                </div>
              </motion.div>
            )
          )}
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
              Error: {error?.toString() || "Algo salió mal"}
            </motion.div>
          )}
        </div>
      </ScrollArea>
      <form onSubmit={handleSubmit} className="flex space-x-2">
        <Input
          value={input}
          onChange={handleInputChange}
          placeholder={
            language === "es"
              ? "Haz una pregunta sobre el video..."
              : "Ask a question about the video..."
          }
          className="flex-grow bg-background/50 backdrop-blur-sm"
          disabled={isLoading}
        />
        <Button
          type="submit"
          disabled={isLoading}
          className="bg-primary hover:bg-primary/80 text-primary-foreground transition-colors duration-200 whitespace-nowrap"
        >
          {isLoading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full"
            />
          ) : language === "es" ? (
            "Enviar"
          ) : (
            "Send"
          )}
        </Button>
      </form>
    </div>
  );
};

export default VideoChat;
