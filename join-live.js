// Example frontend helper to join a live session via Netlify function
// This function should be called when the user clicks “Join the Link‑Up Now” or
// reserves a spot.  It passes the user IDs and session key to the backend
// Netlify function, then navigates to the returned Daily room URL.

export async function joinLive(userA, userB, sessionKey) {
  try {
    const response = await fetch('/.netlify/functions/create-daily-room', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userA, userB, sessionKey }),
    });
    const data = await response.json();
    if (response.ok) {
      // Redirect the browser to the Daily room URL
      window.location.href = data.roomUrl;
    } else {
      console.error('Error creating room:', data.error);
      alert('Unable to join live session. Please try again later.');
    }
  } catch (err) {
    console.error('Unexpected error creating room:', err);
    alert('Unexpected error joining live session.');
  }
}