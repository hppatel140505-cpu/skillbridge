export const rawBodyBuffer = (req, res, buf) => {
  if (req.originalUrl.startsWith("/api/webhooks/stripe")) {
    req.rawBody = buf; // buffer hi rakho (string mat banao)
  }
};
