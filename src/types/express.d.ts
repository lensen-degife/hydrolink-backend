import { AccessTokenPayload } from "@/utils/jwt";

// Augment Express's Request type so `req.user` is available
// after the auth middleware runs.
declare global {
  namespace Express {
    interface Request {
      user?: AccessTokenPayload;
    }
  }
}

export {};
