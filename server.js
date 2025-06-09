require('dotenv').config();
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const { fetchBookmarks } = require('./scripts/fetchBookmarks');

app.use(express.static('public'));
app.set('view engine', 'ejs');

// Home page
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// Bookmarks page
app.get('/bookmarks', async (req, res) => {
  try {
    const bookmarks = await fetchBookmarks();
    res.render('bookmarks', { bookmarks });
  } catch (error) {
    res.status(500).send('Error loading bookmarks');
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
