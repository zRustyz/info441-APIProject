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
  console.log(videoID);
  const youtube = google.youtube({
    version: "v3",
    auth: process.env.YT_API_KEY
  });

  const response = await youtube.videos.list({
    part: "snippet,contentDetails,statistics",
    id: videoID
  });

  console.log(response.data);

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
        <a href="https://www.youtube.com/watch?v=${videoData.id}" target="_blank" rel="noopener noreferrer">
          <img src="${videoData.snippet.thumbnails.high.url}" class="card-img-top">
        </a>
        <div class="card-body">
          <h5 class="card-title">${videoData.snippet.title}</h5>
          <p class="card-text"><small class="text-body-secondary">${numberWithCommas(videoData.statistics.viewCount)} views</small></p>
          <div class="d-flex justify-content-between align-items-center">
            <div class="btn-group">
              <button type="button" class="btn btn-sm btn-outline-secondary">❤️</button>
              <button type="button" class="btn btn-sm btn-outline-secondary disabled">0</button>
            </div>

            <small class="text-body-secondary">video duration</small>
          </div>
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