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

export function extractVideoID (url) {
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

  const response = await youtube.videos.list({
    part: "snippet,contentDetails,statistics",
    id: videoID
  });

  if (response.data) {
    return response.data.items[0];
  } else {
    return null;
  }
}

export async function getVideoPreview (url) {
  const videoID = extractVideoID(url);
  if (videoID) {
    const videoData = await fetchVideoData(videoID);
    console.log(videoData);
    return (`
      <div class="card shadow-sm">
        <iframe
          src="https://www.youtube.com/embed/${escapeHTML(videoData.id)}?modestbranding=1&rel=0"
          class="card-img-top"
          frameborder="0"
          width="560"
          height="315"
          allowfullscreen>
        </iframe>
        <div class="card-body">
          <h5 class="card-title">${videoData.snippet.title}</h5>
          <p class="card-text"><small class="text-body-secondary">${numberWithCommas(videoData.statistics.viewCount)} views</small></p>
        </div>
      </div>
    `);
  } else {
    return null;
  }
}

export function numberWithCommas (x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}