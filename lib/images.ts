export const images = {
  logo: {
    nav: {
      src: "/images/logo/mark-cream.png",
      width: 360,
      height: 433,
      alt: "Katalyze",
    },
  },
  product: {
    deviceHero: {
      src: "/images/product/device-hero.jpg",
      width: 1080,
      height: 1440,
      alt: "The Katalyze device, with six cartridges visible through the frosted window",
    },
    skinMacro: {
      src: null,
      width: 1000,
      height: 1250,
      alt: "Close macro detail of skin, lit by data points",
    },
  },
  cartridges: {
    base: [
      { src: null, width: 320, height: 320, alt: "Base formula cartridge" },
      { src: null, width: 320, height: 320, alt: "Base formula cartridge" },
      { src: null, width: 320, height: 320, alt: "Base formula cartridge" },
    ],
    active: [
      { src: null, width: 320, height: 320, alt: "Hyaluronic acid cartridge" },
      { src: null, width: 320, height: 320, alt: "Niacinamide cartridge" },
      { src: null, width: 320, height: 320, alt: "Ceramide cartridge" },
    ],
  },
} as const;
