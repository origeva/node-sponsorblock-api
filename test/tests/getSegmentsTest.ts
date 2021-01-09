import SponsorBlock from '../../src/index';
import { strict as assert } from 'assert';
import { isSegment } from '../../src/types/segment.model';

export async function getSegmentsTest(sponsorBlock?: SponsorBlock): Promise<void> {
	sponsorBlock = sponsorBlock ? sponsorBlock : SponsorBlock.newUser();
	let segments = await sponsorBlock.getSegments('jiK2jmTVF3A');
	assert.ok(segments.every(isSegment), `sponsorBlock.getSegments('jiK2jmTVF3A'): segments is not of type Segment[]`);
	assert.equal(segments[0].category, 'sponsor', `sponsorBlock.getSegments('jiK2jmTVF3A'): Default category from API is not "sponsor"`);
	segments = await sponsorBlock.getSegments('jiK2jmTVF3A', 'intro', 'outro');
	assert.ok(
		segments.every((segment) => segment.category === 'intro' || segment.category === 'outro'),
		`sponsorBlock.getSegments('jiK2jmTVF3A', 'intro', 'outro'): Not every category is as requested`
	);
}
