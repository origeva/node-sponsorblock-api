# node-sponsorblock-api

### Node module wrapper for SponsorBlock web API.

#### Now works with the browser's runtime.

#### https://sponsor.ajay.app/

Complete API documentation can be found [here](https://github.com/ajayyy/SponsorBlock/wiki/API-Docs).
Please review the [attriution template](https://gist.github.com/ajayyy/4b27dfc66e33941a45aeaadccb51de71) to abide the [license](https://github.com/ajayyy/SponsorBlock/wiki/Database-and-API-License).

This is a very new library and I will be updating it frequently for small improvements.
I intend to keep the function signatures the same but it may change in case of a fundamental mistake on my part or an API change with SponsorBlock, for any suggestions you're more than welcome to open an issue on GitHub.

###### Usage:

```javascript
const { SponsorBlock } = require('sponsorblock-api');
const sponsorBlock = new SponsorBlock(userID); // userID is a locally generated uuid, save the id for future tracking of stats

sponsorBlock.getSegments(videoID, 'intro', 'outro').then((segments) => {
	console.log(segments);
});
```

###### Typescript:

```typescript
import { SponsorBlock } from 'sponsorblock-api';
const sponsorBlock = new SponsorBlock(userID); // userID is a locally generated uuid, save the id for future tracking of stats

sponsorBlock.getSegments(videoID, 'sponsor', 'selfpromo').then((segments) => {
	console.log(segments);
});
```

##### Notice:

- userID should be a locally generated UUID, and should be saved for future requests for the API to keep track of stats of a person, treat like a password.
- You may import SponsorBlockVIP or SponsorBlockAdmin for more functions, the added functions will only work if your userID has the permissions.

###### Error handling:

Every API call will throw an error if the response status is not 200, the error object will contain a status and message properties.

```javascript
try {
	await sponsorBlock.getSegments('videoID that will not be found');
} catch (e) {
	console.log(e.status); // 404
	console.log(e.message); // Not found
	console.log(e.name); // ResponseError
}
```

```typescript
import { ResponseError } from 'sponsorblock-api'
try {
	await sponsorBlock.getSegments('videoID that will not be found');
} catch (e) {
	if (e instaceof ResponseError) {
		// SponsorBlock error handling
	}
}
```

Currently there seems to be an issue where VS Code will show function parameters to be of type 'any'. **Fixed as of 0.1.2** .d.ts issue

###### API interface:

```typescript
interface SponsorBlockAPI {
	userID: string;
	options: SponsorBlockOptions;

	getSegments(video: VideoResolvable, ...categories: Category[]): Promise<Segment[]>;

	postSegments(video: VideoResolvable, ...segments: LocalSegment[]): Promise<void>;

	getSegmentsPrivately(video: VideoResolvable, ...categories: Category[]): Promise<Segment[]>;

	vote(segment: SegmentResolvable, type: VoteType): Promise<void>;

	voteCategory(segment: SegmentResolvable, category: Category): Promise<void>;

	viewed(segment: SegmentResolvable): Promise<void>;

	getViews(): Promise<number>;

	getTimeSaved(): Promise<number>;

	setUsername(username: string): Promise<void>;

	getUsername(): Promise<string>;

	getTopUsers(sortType: SortType): Promise<UserStats[]>;

	getOverallStats(): Promise<OverallStats>;

	getDaysSaved(): Promise<number>;

	isVIP(): Promise<boolean>;

	getHashedUserID(): string;
}
```

###### Types:

```typescript
type Category = 'sponsor' | 'intro' | 'outro' | 'interaction' | 'selfpromo' | 'music_offtopic';
type LocalSegment = { startTime: number; endTime: number; category: Category }; // only used for posting new segments
type Segment = { UUID: string; startTime: number; endTime: number; category: Category };
type Video = { videoID: string; hash: string; segments: Segment[] };
type VoteType = 'down' | 'up' | 0 | 1; // 0 for down, 1 for up
type CategoryVote = { UUID: string; category: Category };
type OverallStats = { userCount: number; viewCount: number; totalSubmissions: number; minutesSaved: number };
type UserStats = { userName: string; viewCounts: number; totalSubmissions: number; minutesSaved: number };
type SortType = 'minutesSaved' | 'viewCount' | 'totalSubmissions' | 0 | 1 | 2; // numbers match types respectively

type SegmentUUID = string;
type SegmentResolvable = Segment | SegmentUUID;
type VideoID = string;
type VideoResolvable = Video | VideoID;

// Accepted hash prefix length for getSegmentsPrivately
type PrefixRange = 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23 | 24 | 25 | 26 | 27 | 28 | 29 | 30 | 31 | 32;
```

## Issues:

Feel free to open an issue for suggestions or any unexpected behavior encountered
