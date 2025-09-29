/**
 * Determines the correct avatar URL to display based on user settings.
 * @param {object} user - The user object which may contain qq and use_qq_avatar properties.
 * @returns {string} The final avatar URL.
 */
export const getDisplayAvatar = (user) => {
  // If user wants to use QQ avatar and has a valid QQ number
  if (user && user.use_qq_avatar && user.qq) {
    // Use http as per the original requirement, but https is generally safer
    return `http://q.qlogo.cn/headimg_dl?dst_uin=${user.qq}&spec=640&img_type=jpg`;
  }
  
  // Otherwise, return their custom avatar URL or a default placeholder
  // A generic user icon SVG could be placed in /public
  return user?.avatar_url || '/default-avatar.svg'; 
};