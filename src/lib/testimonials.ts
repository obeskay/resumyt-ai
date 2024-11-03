export const getTestimonials = (dict: any) => [
  {
    quote:
      dict.home?.testimonials?.quote1 ??
      "Resumyt has saved me hours of time watching long videos. Now I can get the key information in minutes.",
    name: dict.home?.testimonials?.name1 ?? "Mary G.",
    title: dict.home?.testimonials?.title1 ?? "University student",
  },
  {
    quote:
      dict.home?.testimonials?.quote2 ??
      "Amazing for preparing presentations. Resumyt extracts the key points I need to create impactful content.",
    name: dict.home?.testimonials?.name2 ?? "James M.",
    title: dict.home?.testimonials?.title2 ?? "Marketing manager",
  },
  {
    quote:
      dict.home?.testimonials?.quote3 ??
      "Thanks to Resumyt, I can keep up with the latest programming tutorials without spending hours watching videos.",
    name: dict.home?.testimonials?.name3 ?? "Anna L.",
    title: dict.home?.testimonials?.title3 ?? "Software developer",
  },
  {
    quote:
      dict.home?.testimonials?.quote4 ??
      "Resumyt is an essential tool for anyone who wants to learn quickly. Now I can absorb information more efficiently.",
    name: dict.home?.testimonials?.name4 ?? "Charles V.",
    title: dict.home?.testimonials?.title4 ?? "University student",
  },
];
