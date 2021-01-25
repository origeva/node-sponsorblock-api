import { SponsorBlockOptions } from './apis/interfaces';

export const config: SponsorBlockOptions = {
	baseURL: 'https://sponsor.ajay.app', // Base URL for the api endpoints
	hashPrefixLength: 4, // Recommended prefix length to use for getting segments privately, to balance between privacy and more accurate results
};

export { SponsorBlock, SponsorBlockVIP, SponsorBlockAdmin } from './apis/first';
export { SponsorBlockLegacy } from './apis/legacy';
export { validateYoutubeURL, extractVideoID } from './utils';
export { ResponseError } from './apis/ResponseError';
