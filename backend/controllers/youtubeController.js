// GET /api/youtube/search?q=...
// Proxies the YouTube Data API v3 search endpoint. Done on the backend (not
// called directly from the browser) so the API key never gets exposed to
// users viewing the frontend's network requests.
async function searchVideos(req, res, next) {
  try {
    const { q } = req.query;
    if (!q || !q.trim()) {
      return res.status(400).json({ message: "A search query is required" });
    }

    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
      return res.status(400).json({
        message:
          "YouTube search is not set up yet. Add YOUTUBE_API_KEY to backend/.env to enable it.",
      });
    }

    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=10&q=${encodeURIComponent(q)}&key=${apiKey}`;
    const response = await fetch(url);

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      console.error("YouTube API error:", response.status, body);
      return res
        .status(502)
        .json({
          message: "Could not search YouTube right now, please try again",
        });
    }

    const data = await response.json();
    const results = (data.items || [])
      .filter((item) => item.id?.videoId)
      .map((item) => ({
        videoId: item.id.videoId,
        title: item.snippet.title,
        channelTitle: item.snippet.channelTitle,
        thumbnail:
          item.snippet.thumbnails?.medium?.url ||
          item.snippet.thumbnails?.default?.url ||
          "",
      }));

    res.json({ results });
  } catch (err) {
    next(err);
  }
}

module.exports = { searchVideos };
