require('dotenv').config();
const { TwitterApi } = require('twitter-api-v2');

module.exports.fetchBookmarks = async () => {
  const client = new TwitterApi({
    appKey: process.env.TWITTER_API_KEY,
    appSecret: process.env.TWITTER_API_SECRET,
    accessToken: process.env.TWITTER_ACCESS_TOKEN,
    accessSecret: process.env.TWITTER_ACCESS_SECRET,
  });

  const bookmarks = [];
  let pagination_token = null;

  do {
    const response = await client.v2.bookmarks({
      expansions: ['author_id'],
      'tweet.fields': ['created_at', 'public_metrics'],
      'user.fields': ['username', 'profile_image_url'],
      max_results: 100,
      pagination_token
    });

    bookmarks.push(...response.data);
    pagination_token = response.meta.next_token;
  } while (pagination_token);

  return processBookmarks(bookmarks);
};

// Process and sort bookmarks
function processBookmarks(bookmarks) {
  const grouped = {};
  
  bookmarks.forEach(tweet => {
    const author = tweet.author_id;
    if (!grouped[author]) {
      grouped[author] = {
        username: tweet.includes.users[0].username,
        profile_image: tweet.includes.users[0].profile_image_url,
        tweets: []
      };
    }
    
    grouped[author].tweets.push({
      id: tweet.id,
      text: tweet.text,
      created_at: tweet.created_at,
      url: `https://twitter.com/${grouped[author].username}/status/${tweet.id}`,
      likes: tweet.public_metrics.like_count
    });
  });
  
  // Sort authors by most bookmarked
  return Object.entries(grouped)
    .sort((a, b) => b[1].tweets.length - a[1].tweets.length)
    .map(([_, authorData]) => authorData);
}
