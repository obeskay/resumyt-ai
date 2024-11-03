import {
  Clipboard,
  Clock,
  Brain,
  Users,
  Layout,
  Lightbulb,
  Settings,
  Accessibility,
} from "lucide-react";

export const getFeatures = (dict: any) => [
  {
    icon: <Clipboard className="h-12 w-12 text-primary" />,
    title: dict.home?.features?.quickSummaries ?? "Quick Summaries",
    description:
      dict.home?.features?.quickSummariesDesc ??
      "Get the key points of any video in seconds.",
  },
  {
    icon: <Clock className="h-12 w-12 text-primary" />,
    title: dict.home?.features?.timeSaving ?? "Time Saving",
    description:
      dict.home?.features?.timeSavingDesc ??
      "Save up to 90% of your time with instant video summaries.",
  },
  {
    icon: <Brain className="h-12 w-12 text-primary" />,
    title: dict.home?.features?.acceleratedLearning ?? "Accelerated Learning",
    description:
      dict.home?.features?.acceleratedLearningDesc ??
      "Learn faster and more efficiently with our AI-powered summaries.",
  },
  {
    icon: <Users className="h-12 w-12 text-primary" />,
    title: dict.home?.features?.forEveryone ?? "For Everyone",
    description:
      dict.home?.features?.forEveryoneDesc ??
      "Perfect for students, professionals, and lifelong learners.",
  },
  {
    icon: <Layout className="h-12 w-12 text-primary" />,
    title: dict.home?.features?.diverseContent ?? "Diverse Content",
    description:
      dict.home?.features?.diverseContentDesc ??
      "Support for multiple languages and video formats.",
  },
  {
    icon: <Lightbulb className="h-12 w-12 text-primary" />,
    title: dict.home?.features?.valuableInsights ?? "Valuable Insights",
    description:
      dict.home?.features?.valuableInsightsDesc ??
      "Extract key insights and main takeaways instantly.",
  },
];
