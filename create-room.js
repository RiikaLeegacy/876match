// Netlify Function to create a Daily room by name.
// The Speed Link frontend posts to `/api/create-room` with `{ roomName }`.
// This function calls the Daily REST API using the API key stored in
// environment variables to create the room.  If the room already exists,
// Daily will return a 409, and we simply construct the URL.  On success
// the function returns an object with the room name and URL.

export async function handler(event) {
  try {
    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        body: JSON.stringify({ error: 'Method not allowed' }),
      };
    }

    let payload;
    try {
      payload = JSON.parse(event.body || '{}');
    } catch (err) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid JSON payload' }),
      };
    }

    const { roomName } = payload;
    if (!roomName) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required parameter: roomName' }),
      };
    }

    const apiKey = process.env.DAILY_API_KEY;
    const domain = process.env.DAILY_DOMAIN;
    if (!apiKey || !domain) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Daily API key or domain is not configured' }),
      };
    }

    // Attempt to create the room via Daily REST API
    // If the room already exists, Daily returns 409; we treat that as success.
    const createBody = {
      name: roomName,
      properties: {
        // Expire the room after 2 hours (optional)
        exp: Math.floor(Date.now() / 1000) + 7200,
        max_participants: 2,
        enable_chat: false,
        enable_screenshare: false,
        start_video_off: false,
        start_audio_off: false,
        enable_knocking: false,
      },
    };

    let roomCreated = false;
    try {
      const response = await fetch('https://api.daily.co/v1/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(createBody),
      });
      if (response.ok) {
        roomCreated = true;
      } else if (response.status !== 409) {
        // If not conflict, treat as error
        const errorText = await response.text();
        return {
          statusCode: response.status,
          body: JSON.stringify({ error: errorText || 'Failed to create room' }),
        };
      }
    } catch (err) {
      // ignore network errors; we'll still return fallback URL
    }

    // Whether created or already existed, construct the room URL
    const roomUrl = `https://${domain}/${roomName}`;
    return {
      statusCode: 200,
      body: JSON.stringify({ name: roomName, url: roomUrl, created: roomCreated }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message || 'Unexpected error' }),
    };
  }
}