/**
 * Extracts the video ID from the full URL.
 * this function assumes the input is surely a YouTube video URL, otherwise may return null or a part of the input.
 * @param youtubeURL The complete YouTube URL of a video.
 * @returns The video ID extracted from the input URL.
 */
export function extractVideoID(youtubeURL: string): string | null {
	let regex = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
	let matchArray = youtubeURL.match(regex);
	return matchArray && matchArray[2];
}
