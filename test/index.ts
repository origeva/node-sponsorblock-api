import SponsorBlock, { SponsorBlockVIP, extractVideoID } from '../src/index';
// Tests
import { getSegmentsTest } from './tests/getSegmentsTest';
import { isUserVIPTest } from './tests/isUserVIPTest';

// const sponsorBlock = SponsorBlock.newUser();
// sponsorBlock.getSegments('_-JSCn98l-Q', Category.INTERACTION, Category.SELFPROMO).then((data) => console.log(data));

test();

async function test(): Promise<void> {
	const sponsorBlock = new SponsorBlock('test');
	[getSegmentsTest, isUserVIPTest].forEach((fun) => fun(sponsorBlock));
}
