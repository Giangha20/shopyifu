// ========================================
// LUXE SHOP - In-Memory Rate Limiter
// ========================================

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();

const DEFAULT_MAX_REQUESTS = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10);
const DEFAULT_WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10);

// Periodically clean up expired entries every 60 seconds
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    rateLimitMap.forEach((record, key) => {
      if (now > record.resetTime) {
        rateLimitMap.delete(key);
      }
    });
  }, 60000);
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetTime: number;
  total: number;
}

/**
 * Checks whether an identifier has exceeded the allowed number of requests
 * within the given time window.
 *
 * @param identifier Unique key (IP address, user ID, token, etc.)
 * @param maxRequests Maximum allowed requests within windowMs
 * @param windowMs Time window in milliseconds
 */
export function rateLimit(
  identifier: string,
  maxRequests: number = DEFAULT_MAX_REQUESTS,
  windowMs: number = DEFAULT_WINDOW_MS
): RateLimitResult {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  // If entry does not exist or window has expired, reset counter
  if (!record || now > record.resetTime) {
    const resetTime = now + windowMs;
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime,
    });

    return {
      success: true,
      remaining: maxRequests - 1,
      resetTime,
      total: maxRequests,
    };
  }

  // If limit reached
  if (record.count >= maxRequests) {
    return {
      success: false,
      remaining: 0,
      resetTime: record.resetTime,
      total: maxRequests,
    };
  }

  // Increment counter
  record.count += 1;

  return {
    success: true,
    remaining: maxRequests - record.count,
    resetTime: record.resetTime,
    total: maxRequests,
  };
}

/**
 * Clears rate limiting for a specific identifier
 */
export function resetRateLimit(identifier: string): void {
  rateLimitMap.delete(identifier);
}
