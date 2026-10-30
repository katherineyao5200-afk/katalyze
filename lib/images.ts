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
  prototype: {
    front: {
      src: "/images/prototype/prototype-front.jpg",
      width: 960,
      height: 1708,
      alt: "The working Katalyze prototype: six amber bottles feeding tubes into a stacked white housing with a pull-out cup drawer",
    },
    electronics: {
      src: "/images/prototype/prototype-electronics.jpg",
      width: 910,
      height: 512,
      alt: "Inside the prototype: the controller board and wiring",
    },
    pumps: {
      src: "/images/prototype/prototype-pumps.jpg",
      width: 910,
      height: 512,
      alt: "Six labeled peristaltic pumps, one per cartridge channel",
    },
  },
  founder: {
    portrait: {
      src: "/images/founder/katherine.jpg",
      width: 850,
      height: 1280,
      alt: "Katherine Yao, founder of Katalyze",
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
