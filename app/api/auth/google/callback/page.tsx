'use client';

import { useEffect } from 'react';

export default function GoogleCallback() {
  useEffect(() => {
    // Get access token from URL hash
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.replace('#', '?'));
    const accessToken = params.get('access_token');

    if (accessToken) {
      // Fetch user info from Google
      fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
        .then((res) => res.json())
        .then((userData) => {
          // Send user data to parent window
          if (window.opener) {
            window.opener.postMessage(
              {
                type: 'GOOGLE_AUTH_SUCCESS',
                user: {
                  name: userData.name,
                  email: userData.email,
                  image: userData.picture,
                  provider: 'google',
                },
              },
              window.location.origin
            );
          }
          // Close popup
          window.close();
        })
        .catch((error) => {
          console.error('Failed to fetch user info:', error);
          if (window.opener) {
            window.opener.postMessage(
              { type: 'GOOGLE_AUTH_ERROR', error: 'Failed to get user info' },
              window.location.origin
            );
          }
          window.close();
        });
    } else {
      // No access token, close popup
      if (window.opener) {
        window.opener.postMessage(
          { type: 'GOOGLE_AUTH_ERROR', error: 'No access token' },
          window.location.origin
        );
      }
      window.close();
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-sky-500 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Completing sign in...</p>
      </div>
    </div>
  );
}
