# node-sponsorblock-api

### Node module wrapper for SponsorBlock web API.

#### Now works with the browser's runtime.

#### https://sponsor.ajay.app/

Complete API documentation can be found [here](https://wiki.sponsor.ajay.app/index.php/API_Docs).
Please review the [attriution template](https://gist.github.com/ajayyy/4b27dfc66e33941a45aeaadccb51de71) to abide the [license](https://github.com/ajayyy/SponsorBlock/wiki/Database-and-API-License).

##### Usage:

###### JavaScript:

```javascript
const { SponsorBlock } = require('sponsorblock-api');
const sponsorBlock = new SponsorBlock(userID); // userID should be a locally generated uuid, save the id for future tracking of stats

sponsorBlock.getSegments(videoID, ['intro', 'outro']).then((segments) => {
	console.log(segments);
});
```

###### TypeScript:

```typescript
import { SponsorBlock, Category } from 'sponsorblock-api';
const sponsorBlock = new SponsorBlock(userID); // userID should be a locally generated uuid, save the id for future tracking of stats

const categories: Category[] = ['sponsor', 'selfpromo']
sponsorBlock.getSegments(videoID, categories).then((segments) => {
	console.log(segments);
});
```

###### Some constants and types are exported for ease of use:

```typescript
import { SponsorBlock, Constants, PrefixRange } from 'sponsorblock-api'

const prefixLength: PrefixRange = 4
const sponsorBlock = new SponsorBlock(userID, { hashPrefixLength: prefixLength })

sponsorBlock.getSegmentsPrivately(videoID, Constants.ALL_CATEGORIES)
```

##### Notice:

- userID should be a locally generated UUID, and should be saved for future requests for the API to keep track of stats of a person, treat like a password.
- You may import SponsorBlockVIP or SponsorBlockAdmin for more functions, the added functions will only work if your userID has the permissions.

##### Error handling:

Every API call will throw an error if the response status is not 200, the error object will contain a status and message properties.

###### JavaScript:

```javascript
try {
	await sponsorBlock.getSegments('videoID that will not be found');
} catch (e) {
	if (e.name === 'ResponseError') {
		// SponsorBlock error handling
		console.log(e.status); // 404
		console.log(e.message); // Not found
	}
}
```

###### TypeScript:

```typescript
import { ResponseError } from 'sponsorblock-api'
try {
	await sponsorBlock.getSegments('videoID that will not be found');
} catch (e) {
	if (e instanceof ResponseError) {
		// SponsorBlock error handling
	}
}
```

## Issues:

Feel free to open an issue for suggestions or any unexpected behavior encountered.
