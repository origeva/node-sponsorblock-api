import { SponsorBlockOptions } from './apis/interfaces';
import { Service } from './types/segment/Segment';

export const defaultOptions: SponsorBlockOptions = {
	baseURL: 'https://sponsor.ajay.app', // Base URL for the api endpoints
	hashPrefixLength: 4, // Recommended prefix length to use for getting segments privately, to balance between privacy and more accurate results
	service: 'YouTube'
};

export { SponsorBlock, SponsorBlockVIP, SponsorBlockAdmin } from './apis/first';
export { SponsorBlockLegacy } from './apis/legacy';
export { ResponseError } from './errors/ResponseError';
export * from './utils';
export * from './types';
