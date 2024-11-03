export async function shareToSocialMedia(videoId: string, platform: string) {
  const summary = await getSummaryById(videoId);
  const shareUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/summary/${videoId}`;

  switch (platform) {
    case "twitter":
      return `https://twitter.com/intent/tweet?text=${encodeURIComponent(summary.title)}&url=${shareUrl}`;
    // Añadir más plataformas según sea necesario
  }
}
