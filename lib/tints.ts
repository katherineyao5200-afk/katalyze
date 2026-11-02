// One colour per cartridge, used everywhere a cartridge's liquid is drawn
// (the 3D device, the ingredient vials, the blend demo), so the same
// ingredient always looks the same. Palette-derived: bases run from
// periwinkle-white to cream, actives from periwinkle to blush.
export const CARTRIDGE_TINT = {
  "B-01": "#d6daf0", // toner
  "B-02": "#a6abd8", // serum
  "B-03": "#f3ece6", // cream
  "A-01": "#9ba3da", // hyaluronic acid
  "A-02": "#e8ccd2", // niacinamide
  "A-03": "#f2dfe3", // ceramide
} as const;

export type CartridgeCode = keyof typeof CARTRIDGE_TINT;

export const tintHex = (code: CartridgeCode) =>
  parseInt(CARTRIDGE_TINT[code].slice(1), 16);
