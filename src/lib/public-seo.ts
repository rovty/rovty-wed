export const WED_PUBLIC_SEO = {
  title: "Rovty Wed | Digital Wedding Invitations & Guest Management",
  description:
    "Create a wedding invitation website, send personal WhatsApp links, manage RSVPs and guest lists, and organize seating with Rovty Wed.",
  url: "https://wed.rovty.com/",
  image: "https://wed.rovty.com/wed-og.png",
};
export const WED_APPLICATION_SCHEMA = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://wed.rovty.com/#website",
      name: "Rovty Wed",
      url: WED_PUBLIC_SEO.url,
    },
    {
      "@type": "SoftwareApplication",
      "@id": "https://wed.rovty.com/#application",
      name: "Rovty Wed",
      url: WED_PUBLIC_SEO.url,
      description: WED_PUBLIC_SEO.description,
      image: WED_PUBLIC_SEO.image,
      applicationCategory: "LifestyleApplication",
      operatingSystem: "Web",
      featureList: [
        "Digital wedding invitations",
        "Personal WhatsApp links",
        "RSVP management",
        "Guest lists",
        "Seating plans",
        "Wedding website templates",
      ],
      publisher: {
        "@type": "Organization",
        name: "Rovty",
        url: "https://rovty.com/",
      },
      softwareHelp: {
        "@type": "WebPage",
        url: "https://rovty.com/products/wed",
      },
    },
  ],
};
