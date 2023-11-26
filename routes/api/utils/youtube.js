import "dotenv/config";
import { google } from "googleapis";

const escapeHTML = str => String(str).replace(/[&<>'"]/g,
  tag => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  }[tag]));

function extractVideoID (url) {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?]+)/);
  if (match && match.length === 2) {
    return match[1];
  } else {
    return null;
  }
}

export async function fetchVideoData (videoID) {
  const youtube = google.youtube({
    version: "v3",
    auth: process.env.YT_API_KEY
  });

  const response = youtube.videos.list({
    part: "snippet,contentDetails,statistics",
    id: videoID
  });

  return response.data.items[0];
}

export async function getVideoPreview (url) {
  const videoID = extractVideoID(url);
  if (videoID) {
    const videoData = fetchVideoData(videoID);
    console.log(videoData);
  }
}