// src/utils/tokenManager.js

let accessToken = null;

export const getAccessToken = () => accessToken;

export const setAccessToken = (token) => {
    accessToken = token;
};

export const clearTokens = () => {
    accessToken = null;
    // Refresh token is now managed by HttpOnly cookie, so we don't manually clear it here.
    // The backend logout endpoint will clear the cookie.
};
