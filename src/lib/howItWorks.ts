export const getHowItWorks = (dict: any) => [
  {
    step: "1",
    title: dict.home?.howItWorks?.step1 ?? "Paste the URL",
    description:
      dict.home?.howItWorks?.step1Desc ??
      "Simply copy and paste the URL of the YouTube video you want to summarize.",
  },
  {
    step: "2",
    title: dict.home?.howItWorks?.step2 ?? "Choose the format",
    description:
      dict.home?.howItWorks?.step2Desc ??
      "Select between key points, paragraph, or full page.",
  },
  {
    step: "3",
    title: dict.home?.howItWorks?.step3 ?? "Get your summary",
    description:
      dict.home?.howItWorks?.step3Desc ??
      "In seconds, receive a concise and accurate summary of the video content.",
  },
];
