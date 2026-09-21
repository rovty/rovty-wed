export type WeddingIdentity = {
  id: string;
  slug: string;
  bride: string;
  groom: string;
};

/** Keep account identity when importing or transforming a design. */
export function preserveWeddingIdentity<T extends Omit<WeddingIdentity, "id">>(
  content: T,
  identity: Omit<WeddingIdentity, "id">,
): T {
  return {
    ...content,
    slug: identity.slug,
    bride: identity.bride,
    groom: identity.groom,
  };
}

export function identitySupportUrl(
  siteOrigin: string,
  wedding: WeddingIdentity,
) {
  const url = new URL("/contact", siteOrigin);
  // A fragment keeps wedding details out of HTTP requests and referrers.
  // Only public wedding identity is included; never session or guest tokens.
  url.hash = `wed-identity=${encodeURIComponent(
    JSON.stringify({
      id: wedding.id,
      slug: wedding.slug.slice(0, 200),
      bride: wedding.bride.slice(0, 80),
      groom: wedding.groom.slice(0, 80),
    }),
  )}`;
  return url.href;
}
