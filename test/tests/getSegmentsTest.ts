import SponsorBlock from '../../src';
import { strict as assert } from 'assert';

export async function getSegmentsTest(sponsorBlock?: SponsorBlock): Promise<void> {
	sponsorBlock = sponsorBlock ? sponsorBlock : SponsorBlock.newUser();
	var segment = (await sponsorBlock.getSegments('bFZ5xdzXKVw'))[0];
	assert.ok(segment.UUID, 'getSegmentsTest(sponsorBlock?: SponsorBlock): segment.UUID is falsy');
	assert.ok(segment.category, 'getSegmentsTest(sponsorBlock?: SponsorBlock): segment.category is falsy');
	assert.ok(segment.segment, 'getSegmentsTest(sponsorBlock?: SponsorBlock): segment.segment is falsy');
}
