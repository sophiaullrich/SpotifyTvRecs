const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = 3001;

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;

// Login route to redirect to Spotify's authorization page
app.get('/login', (req, res) => {
  const scope = 'user-top-read';
  const authURL = `https://accounts.spotify.com/authorize?response_type=code&client_id=${SPOTIFY_CLIENT_ID}&scope=${encodeURIComponent(
    scope
  )}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;
  res.redirect(authURL);
});

// Callback route to handle Spotify's response
app.get('/callback', async (req, res) => {
  const code = req.query.code || null;

  try {
    const tokenResponse = await axios.post(
      'https://accounts.spotify.com/api/token',
      new URLSearchParams({
        code,
        redirect_uri: REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
      {
        headers: {
          Authorization: `Basic ${Buffer.from(
            `${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`
          ).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    const access_token = tokenResponse.data.access_token;

    // Redirect to a frontend route or show success
    res.redirect(`/dashboard?access_token=${access_token}`);
  } catch (error) {
    console.error('Error during Spotify authentication:', error);
    res.send('Authentication failed.');
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});