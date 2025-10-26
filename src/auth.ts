export const get_auth_key = (): String => {
  return process.env.LOCKBOX_AUTH_KEY!;
};
