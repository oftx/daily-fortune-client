// MOCK API - Replace with actual axios calls to your backend
import { FORTUNE_TYPES } from '../utils/constants';

const mockApi = {
  getRegisterStatus: async () => {
    console.log("API: Checking registration status...");
    return { success: true, data: { isOpen: true } };
  },

  login: async (username, password) => {
    console.log("API: Attempting login for", username);
    if (username === "admin" && password === "admin") {
      return { success: true, data: { token: "fake-admin-token", user: { username: "admin", role: "admin" } } };
    }
    if (password === "password") {
      return { success: true, data: { token: "fake-user-token", user: { username: username, role: "user" } } };
    }
    return { success: false, error: "Invalid username or password" };
  },

  register: async (username, email, password) => {
     console.log("API: Registering user", username);
     return { success: true, data: { token: "fake-user-token", user: { username: username, role: "user" } } };
  },

  // *** MODIFIED: This function now handles both authenticated and anonymous requests ***
  drawFortune: async (token) => {
    // Log whether the draw is for a logged-in user or an anonymous one.
    console.log("API: Drawing fortune. Token:", token || "None (Anonymous)");
    
    // In a real backend, if a token is provided, you would find the user and
    // check if they have already drawn today before recording the result.
    // For this mock, the random generation is the same for everyone.
    
    const rand = Math.random();
    let result;
    if (rand <= 0.8) {
        const goodFortunes = [FORTUNE_TYPES.S_KICHI, FORTUNE_TYPES.DAI_KICHI, FORTUNE_TYPES.KICHI, FORTUNE_TYPES.SHO_KICHI];
        result = goodFortunes[Math.floor(Math.random() * goodFortunes.length)];
    } else {
        const badFortunes = [FORTUNE_TYPES.KYO, FORTUNE_TYPES.DAI_KYO];
        result = badFortunes[Math.floor(Math.random() * badFortunes.length)];
    }
    return { success: true, data: { fortune: result } };
  },

  getProfileData: async (username) => {
      console.log("API: Getting profile for", username);
      const displayUsername = (username === 'me' || username === 'testuser') ? 'testuser' : username;
      const history = Array.from({ length: 365 }).map((_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const fortunes = Object.values(FORTUNE_TYPES);
          return {
              date: date.toISOString().split('T')[0],
              fortune: fortunes[Math.floor(Math.random() * fortunes.length)],
          }
      });
      return {
          success: true,
          data: {
              username: displayUsername,
              bio: "永远相信美好的事情即将发生。",
              joinDate: "2024-01-01",
              lastOnline: "5分钟前",
              history: history
          }
      };
  }
};

export default mockApi;