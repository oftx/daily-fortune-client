/**
 * Darkens a hex color by a given percentage.
 * @param {string} hex - The hex color code (e.g., "#RRGGBB").
 * @param {number} percent - The percentage to darken by (e.g., 20 for 20%).
 * @returns {string} The new, darker hex color code.
 */
export const darkenColor = (hex, percent) => {
    hex = hex.replace(/^#/, '');

    let r = parseInt(hex.substring(0, 2), 16);
    let g = parseInt(hex.substring(2, 4), 16);
    let b = parseInt(hex.substring(4, 6), 16);

    const amount = (100 - percent) / 100;
    r = Math.floor(r * amount);
    g = Math.floor(g * amount);
    b = Math.floor(b * amount);

    const toHex = (c) => ('0' + c.toString(16)).slice(-2);

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};