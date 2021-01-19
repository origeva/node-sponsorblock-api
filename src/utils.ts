const regex = /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|v\/)?)([\w\-]+)(\S+)?$/;

/**
 * Extracts the video ID from the full URL.
 * this function assumes the input is surely a YouTube video URL, otherwise may return null or a part of the input.
 * @param youtubeURL The complete YouTube URL of a video.
 * @returns The video ID extracted from the input URL.
 */
export function extractVideoID(youtubeURL: string): string | null {
	let matchArray = youtubeURL.match(regex);
	return matchArray && matchArray[5];
}

export function validateYoutubeURL(youtubeURL: string): boolean {
	return regex.test(youtubeURL);
}
