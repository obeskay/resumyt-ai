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
import { generateAndSaveSuggestedQuestions } from "@/lib/utils";
import { MessageCircle, Sparkles, ChevronDown } from "lucide-react";
import ShineBorder from "@/components/ui/shine-border";

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
    api: "/api/chat-with-video",
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

      if (
        data &&
        data.suggested_questions &&
        data.suggested_questions.length > 0
      ) {
        setSuggestedQuestions(data.suggested_questions);
      } else {
        const generatedQuestions = await generateAndSaveSuggestedQuestions(
          videoId,
          language,
        );
        setSuggestedQuestions(generatedQuestions);
      }
    } catch (error) {
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
      className="space-y-2 max-w-full"
    >
      <ShineBorder
        className="rounded-lg p-2 shadow-lg mx-auto relative"
        color={["hsl(var(--secondary))", "hsl(var(--secondary-foreground))"]}
      >
        <div className="flex items-center space-x-1">
          <MessageCircle className="w-4 h-4 text-secondary" />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex items-center space-x-1"
          >
            <Sparkles className="w-3 h-3 text-secondary" />
            <span className="text-sm font-medium text-secondary">
              {language === "es"
                ? "¡Nuevo! Chat disponible"
                : "New! Chat available"}
            </span>
          </motion.div>
        </div>
        <motion.div
          animate={{ y: [0, 5, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="absolute bottom-1 left-1/2 transform -translate-x-1/2"
        >
          <ChevronDown className="w-3 h-3 text-secondary" />
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
                    className={`p-2 rounded-lg ${message.role === "user" ? "bg-primary text-primary-foreground" : "bg-secondary/10 text-foreground dark:bg-secondary/10 dark:text-secondary-foreground"} shadow-md max-w-[85%]`}
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
                  {language === "es"
                    ? "Generando preguntas sugeridas..."
                    : "Generating suggested questions..."}
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
                <p className="text-sm font-semibold text-center text-primary">
                  {language === "es"
                    ? "Preguntas sugeridas:"
                    : "Suggested questions:"}
                </p>
                <div className="flex flex-col gap-2">
                  {suggestedQuestions.map((question, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => handleSuggestedQuestion(question)}
                      className="text-sm font-medium py-2 hover:bg-primary hover:text-primary-foreground transition-all duration-300 whitespace-normal text-left h-auto"
                    >
                      <span className="line-clamp-2">{question}</span>
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
                Error: {error?.toString() || "Algo salió mal"}
              </motion.div>
            )}
          </div>
        </ScrollArea>
        <form onSubmit={handleSubmit} className="flex space-x-2 mt-2">
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder={
              language === "es"
                ? "Pregunta sobre el video..."
                : "Ask about the video..."
            }
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
            ) : language === "es" ? (
              "Enviar"
            ) : (
              "Send"
            )}
          </Button>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default VideoChat;
