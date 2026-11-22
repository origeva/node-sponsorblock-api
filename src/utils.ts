/**
 * Extracts the video ID from the full URL.
 * Supports watch, shorts, live, embed, v and youtu.be URLs, with or without
 * a protocol, including music.youtube.com and query parameters in any order.
 * @param youtubeURL The complete YouTube URL of a video.
 * @returns The video ID extracted from the input URL, or null if it is not a YouTube video URL.
 */
export function extractVideoID(youtubeURL: string): string | null {
	let url: URL;
	try {
		const trimmed = youtubeURL.trim();
		if (!trimmed) return null;
		const withProtocol = trimmed.startsWith('//')
			? `https:${trimmed}`
			: /^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed)
			? trimmed
			: `https://${trimmed}`;
		url = new URL(withProtocol);
	} catch {
		return null;
	}
	if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;

	const hostname = url.hostname.toLowerCase();
	const isShortHost = hostname === 'youtu.be';
	const isYoutubeHost = hostname === 'youtube.com' || hostname.endsWith('.youtube.com');
	if (!isShortHost && !isYoutubeHost) return null;

	let videoID: string | null = null;
	if (isShortHost) {
		videoID = url.pathname.split('/').filter(Boolean)[0] ?? null;
	} else {
		const path = url.pathname.split('/').filter(Boolean);
		if (path[0] === 'watch') {
			videoID = url.searchParams.get('v');
		} else if (path[0] === 'shorts' || path[0] === 'live' || path[0] === 'embed' || path[0] === 'v') {
			videoID = path[1] ?? null;
		}
	}
	return videoID && /^[\w-]+$/.test(videoID) ? videoID : null;
}

export function validateYoutubeURL(youtubeURL: string): boolean {
	return extractVideoID(youtubeURL) !== null;
}
