export interface HandoffIdentity {
  user_id: string;
  session_id: string;
  email: string;
  product: "wed";
  version: 2;
}
export interface ProductTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  user: { id: string };
}
export interface HandoffBackend {
  link(platformUserId: string, email: string): Promise<string | null>;
  create(email: string): Promise<void>;
  updateEmail(userId: string, email: string): Promise<void>;
  signIn(email: string): Promise<ProductTokens>;
  bind(userId: string, token: string, identity: HandoffIdentity): Promise<void>;
  recheck(identity: HandoffIdentity): Promise<void>;
}
export async function finishHandoff(
  identity: HandoffIdentity,
  backend: HandoffBackend,
): Promise<ProductTokens> {
  let user = await backend.link(identity.user_id, identity.email);
  if (!user) {
    // Concurrent first sign-ins may both reach create. Only continue after the
    // database confirms a unique stable link, even when create loses that race.
    let creationError: unknown;
    try {
      await backend.create(identity.email);
    } catch (error) {
      creationError = error;
    }
    user = await backend.link(identity.user_id, identity.email);
    if (!user) throw creationError || new Error("Could not link this account");
  }
  await backend.updateEmail(user, identity.email);
  const tokens = await backend.signIn(identity.email);
  if (tokens.user.id !== user) throw new Error("Account identity mismatch");
  await backend.bind(user, tokens.access_token, identity);
  await backend.recheck(identity);
  return tokens;
}
