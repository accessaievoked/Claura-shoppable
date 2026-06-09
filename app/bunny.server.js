const BUNNY_API = "https://video.bunnycdn.com/library";

function getCredentials() {
  const libraryId = process.env.BUNNY_LIBRARY_ID;
  const apiKey    = process.env.BUNNY_API_KEY;
  const cdnHost   = process.env.BUNNY_CDN_HOSTNAME; // e.g. vz-xxxxxx.b-cdn.net
  if (!libraryId || !apiKey || !cdnHost) {
    throw new Error("Missing Bunny Stream env vars (BUNNY_LIBRARY_ID, BUNNY_API_KEY, BUNNY_CDN_HOSTNAME)");
  }
  return { libraryId, apiKey, cdnHost };
}

/**
 * Creates a Bunny Stream video record and tells Bunny to pull the file
 * directly from the R2 public URL — no file transfer through our server.
 *
 * Returns { bunnyId, bunnyUrl } immediately.
 * Bunny transcodes in the background (~1–3 min); the HLS URL is valid
 * straight away but streams fully once transcoding finishes.
 */
export async function createAndFetchVideo(r2Url, title) {
  const { libraryId, apiKey, cdnHost } = getCredentials();
  const headers = {
    AccessKey: apiKey,
    "Content-Type": "application/json",
    accept: "application/json",
  };

  // Step 1 — create an empty video record to get a video ID
  const createRes = await fetch(`${BUNNY_API}/${libraryId}/videos`, {
    method: "POST",
    headers,
    body: JSON.stringify({ title }),
  });
  if (!createRes.ok) {
    const err = await createRes.text();
    throw new Error(`Bunny create video failed: ${err}`);
  }
  const { guid: bunnyId } = await createRes.json();

  // Step 2 — tell Bunny to fetch the video from R2 (async, no timeout risk)
  const fetchRes = await fetch(
    `${BUNNY_API}/${libraryId}/videos/${bunnyId}/fetch`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({ url: r2Url }),
    }
  );
  if (!fetchRes.ok) {
    const err = await fetchRes.text();
    throw new Error(`Bunny fetch video failed: ${err}`);
  }

  // HLS playlist URL — available once Bunny finishes transcoding
  const bunnyUrl = `https://${cdnHost}/${bunnyId}/playlist.m3u8`;

  console.log("✅ Bunny video created:", bunnyId, bunnyUrl);
  return { bunnyId, bunnyUrl };
}

/**
 * Returns the transcoding status for a video.
 * status: 0=queued, 1=processing, 2=encoding, 3=finished, 4=error
 */
export async function getBunnyVideoStatus(bunnyId) {
  const { libraryId, apiKey } = getCredentials();
  const res = await fetch(`${BUNNY_API}/${libraryId}/videos/${bunnyId}`, {
    headers: { AccessKey: apiKey, accept: "application/json" },
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.status; // 3 = finished
}
