export const getFAQs = (dict: any) => [
  {
    question: dict.home?.faq?.q1 ?? "What is Resumyt?",
    answer:
      dict.home?.faq?.a1 ??
      "Resumyt is a platform that provides concise and accurate summaries of YouTube videos in seconds.",
  },
  {
    question: dict.home?.faq?.q2 ?? "How does Resumyt work?",
    answer:
      dict.home?.faq?.a2 ??
      "Resumyt uses advanced AI technology to analyze and summarize YouTube videos. It extracts key points, paragraphs, or full summaries based on your preferences.",
  },
  {
    question: dict.home?.faq?.q3 ?? "Is Resumyt free to use?",
    answer:
      dict.home?.faq?.a3 ??
      "Yes, Resumyt offers a free tier with limited usage. For unlimited access and additional features, you can upgrade to a premium plan.",
  },
  {
    question:
      dict.home?.faq?.q4 ?? "Can I use Resumyt for educational purposes?",
    answer:
      dict.home?.faq?.a4 ??
      "Absolutely! Resumyt is an excellent tool for students, researchers, and educators to save time and learn faster from YouTube videos.",
  },
];
