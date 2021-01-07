import SponsorBlock, { SponsorBlockVIP, SortType } from '../src';
import Segment, { Category } from '../src/types/segment.model';
import Vote, { VoteType } from '../src/types/vote.model';
import { version as uuidVersion, v4 } from 'uuid';
import { strict as assert } from 'assert';
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
