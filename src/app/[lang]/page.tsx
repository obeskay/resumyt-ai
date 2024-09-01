const handleSubmit = async (
  url: string,
  formats: string[],
  videoTitle: string,
) => {
  // ... código existente ...
  const response = await fetch("/api/summarize", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url, formats, videoTitle }),
  });
  // ... resto del código ...
};
