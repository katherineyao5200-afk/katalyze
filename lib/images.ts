export const images = {
  logo: {
    nav: {
      src: "/images/logo/horizontal-dark.png",
      width: 419,
      height: 214,
      alt: "Katalyze",
    },
  },
  product: {
    deviceHero: {
      src: null,
      width: 900,
      height: 1200,
      alt: "The Katalyze device",
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
