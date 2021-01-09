Node module wrapper for SponsorBlock web API.

Still in works

```javascript
const SponsorBlock = require('sponsorblock-api').default;
const sponsorBlock = new SponsorBlock(userID); // userID is a locally generated uuid, save the id for future tracking of stats

sponsorBlock.getSegments(videoID, 'sponsor');
```
