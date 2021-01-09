import SponsorBlock, { SponsorBlockVIP, SortType } from '../src/index';
import Segment, { Category } from '../src/types/segment.model';
// Tests
import { getSegmentsTest } from './tests/getSegmentsTest';
import { isUserVIPTest } from './tests/isUserVIPTest';

// const sponsorBlock = SponsorBlock.newUser();
// sponsorBlock.getSegments('_-JSCn98l-Q', Category.INTERACTION, Category.SELFPROMO).then((data) => console.log(data));

test();

async function test(): Promise<void> {
	const sponsorBlock = SponsorBlock.newUser();
	getSegmentsTest(sponsorBlock);

	// sponsorBlock.postSegment
	// sponsorBlock.postSegments

	isUserVIPTest(sponsorBlock);
}
