import { PrefixRange } from './PrefixRange';
import { Service } from './segment/Segment';

export type SponsorBlockOptions = {
	/**
	 * The base URL to send requests to.
	 * @default https://sponsor.ajay.app
	 */
	baseURL?: string;

	/**
	 * The length of the prefix of the hash to query the server with, the shorter the more private.
	 * Accepts 3-32
	 * @default 4
	 */
	hashPrefixLength?: PrefixRange;

	/**
	 * Service to query segments from
	 * @default 'YouTube'
	 */
	service?: Service;

	/**
	 * UserAgent to use when submitting segments
	 * @default 'node-sponsorblock/version'
	 */
	userAgent?: string;
};
