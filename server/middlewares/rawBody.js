export const rawBodyBuffer = (req, res, buf) => {
  if (req.originalUrl.startsWith("/api/webhooks/stripe")) {
    req.rawBody = buf; // raw buffer rakho, JSON parse mat karo
  }
};
