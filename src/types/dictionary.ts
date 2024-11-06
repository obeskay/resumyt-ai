export interface Dictionary {
  home: {
    title: string;
    subtitle: string;
    metaDescription: string;
    keywords: string;
    remainingQuota: string;
    error: {
      somethingWentWrong: string;
    };
    features: {
      quickSummaries: string;
      quickSummariesDesc: string;
      timeSaving: string;
      timeSavingDesc: string;
      acceleratedLearning: string;
      acceleratedLearningDesc: string;
      forEveryone: string;
      forEveryoneDesc: string;
      diverseContent: string;
      diverseContentDesc: string;
      valuableInsights: string;
      valuableInsightsDesc: string;
    };
    howItWorks: {
      title: string;
      step1: string;
      step1Desc: string;
      step2: string;
      step2Desc: string;
      step3: string;
      step3Desc: string;
    };
    testimonials: {
      title: string;
      quote1: string;
      name1: string;
      title1: string;
      quote2: string;
      name2: string;
      title2: string;
      quote3: string;
      name3: string;
      title3: string;
      quote4: string;
      name4: string;
      title4: string;
    };
    cta: {
      title: string;
      description: string;
      button: string;
    };
    faq: {
      title: string;
      q1: string;
      a1: string;
      q2: string;
      a2: string;
      q3: string;
      a3: string;
      q4: string;
      a4: string;
    };
    videoInput: {
      placeholder: string;
      invalidUrl: string;
      submit: string;
      button: string;
      processing: string;
      quotaExceeded: string;
      upgrade: string;
      or: string;
      waitTomorrow: string;
      errorProcessing: string;
      tryAgain: string;
    };
    formats: {
      title: string;
      keyPoints: string;
      keyPointsDesc: string;
      paragraph: string;
      paragraphDesc: string;
      fullPage: string;
      fullPageDesc: string;
    };
    achievements: {
      unlocked: string;
      summaryGenerated: string;
      progress: string;
    };
    description: string;
    summarizeButton: string;
    dialog: {
      title: string;
      description: string;
      button: string;
    };
    continueButton: string;
    formatQuestion: string;
    videoChat: {
      title: string;
      suggestedQuestions: string;
      inputPlaceholder: string;
      sendButton: string;
      loadingChat: string;
      error: string;
      generatingQuestions: string;
      newChatAvailable: string;
    };
  };
  loading: {
    title: string;
    description: string;
  };
  summary: {
    title: string;
    pageTitle: string;
    summaryTitle: string;
    defaultTitle: string;
    videoIdLabel: string;
    watchOnYoutube: string;
    backToHome: string;
    notFound: string;
    returnHome: string;
    loadingMessage: string;
    errorMessage: string;
  };
  error: {
    title: string;
    message: string;
  };
  alerts: {
    lowQuota: {
      title: string;
      message: string;
    };
  };
  notifications: {
    success: string;
    error: string;
    info: string;
    warning: string;
  };
}
