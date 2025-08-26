import rateLimit, { RateLimitRequestHandler } from "express-rate-limit";

export default class RateLimitMiddleware {
  public static authRateLimiter = (): RateLimitRequestHandler => {
    return rateLimit({
      windowMs: 1 * 60 * 60 * 1000,
      limit: 10,
      standardHeaders: true,
      legacyHeaders: false,
    });
  };

  public static jobRateLimiter = (): RateLimitRequestHandler => {
    return rateLimit({
      windowMs: 1 * 60 * 60 * 1000,
      limit: 100,
      standardHeaders: true,
      legacyHeaders: false,
    });
  };

  public static userRateLimiter = (): RateLimitRequestHandler => {
    return rateLimit({
      windowMs: 1 * 60 * 60 * 1000,
      limit: 100,
      standardHeaders: true,
      legacyHeaders: false,
    });
  };

  public static jobApplicationRateLimiter = (): RateLimitRequestHandler => {
    return rateLimit({
      windowMs: 1 * 60 * 60 * 1000,
      limit: 100,
      standardHeaders: true,
      legacyHeaders: false,
    });
  };
}
