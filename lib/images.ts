export const images = {
  logo: {
    nav: {
      src: "/images/logo/mark-cream.png",
      width: 360,
      height: 433,
      alt: "Katalyze",
    },
    navDark: {
      src: "/images/logo/mark-navy.png",
      width: 367,
      height: 440,
      alt: "Katalyze",
    },
  },
  product: {
    // A still of the 3D hero's first frame (transparent), shown while the
    // live model loads. Regenerate if the model changes.
    poster: {
      src: "/images/product/device-poster.webp",
      width: 1113,
      height: 801,
    },
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
    // The two inside photos were saved under each other's names.
    electronics: {
      src: "/images/prototype/prototype-pumps.jpg",
      width: 910,
      height: 512,
      alt: "Inside the prototype: the controller board and wiring",
    },
    pumps: {
      src: "/images/prototype/prototype-electronics.jpg",
      width: 910,
      height: 512,
      alt: "Six labeled peristaltic pumps, one per cartridge channel",
    },
  },
  // Behind the scenes (Story page). Katherine's own photos.
  story: {
    wiring1: {
      src: "/images/story/bts-wiring-1.jpg",
      width: 491,
      height: 641,
      alt: "Katherine wiring the prototype's controller board at a workbench",
    },
    wiring2: {
      src: "/images/story/bts-wiring-2.jpg",
      width: 735,
      height: 590,
      alt: "Katherine connecting the pump wiring, with the pumps laid out on the table",
    },
    wiring3: {
      src: "/images/story/bts-wiring-3.jpg",
      width: 472,
      height: 661,
      alt: "Katherine fitting tubing and wires into the prototype's pumps",
    },
    visia: {
      src: "/images/story/bts-visia.jpg",
      width: 462,
      height: 559,
      alt: "Katherine at a clinic's VISIA skin-imaging station during research",
    },
    visiaScreen: {
      src: "/images/story/bts-visia-screen.jpg",
      width: 822,
      height: 582,
      alt: "A VISIA results screen showing several skin-analysis views of a face",
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
