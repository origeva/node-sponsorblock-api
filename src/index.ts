import { SponsorBlockOptions } from './types/SponsorBlockOptions';

export const defaultOptions: SponsorBlockOptions = {
	baseURL: 'https://sponsor.ajay.app', // Base URL for the api endpoints
	hashPrefixLength: 4, // Recommended prefix length to use for getting segments privately, to balance between privacy and more accurate results
	service: 'YouTube',
	userAgent: `node-sponsorblock`,
};

export { SponsorBlock } from './api/impl/user';
export { SponsorBlockVIP } from './api/impl/vip';
export { SponsorBlockAdmin } from './api/impl/admin';
export { ResponseError } from './errors/ResponseError';
export * from './utils';
export * from './types';
