import { getBasicInfo } from '@distube/ytdl-core';

export async function getVideoDetails(videoUrl: string) {
  const videoInfo = await getBasicInfo(videoUrl);
  const videoDetails = videoInfo.videoDetails;

  const title = videoDetails.title;
  const thumbnail = videoDetails.thumbnails[videoDetails.thumbnails.length - 1].url;

  return { title, thumbnail };
}