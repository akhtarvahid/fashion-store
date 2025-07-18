import { Injectable, ExecutionContext } from "@nestjs/common";
import { ThrottlerGuard } from "@nestjs/throttler";

// Custom exception class to maintain consistent error messages
export class RateLimitExceededException {
  constructor(
    public readonly message: string,
    public readonly statusCode: number = 429,
    public readonly retryAfter?: number
  ) {}
}

@Injectable()
export class EmailRateLimitGuard extends ThrottlerGuard {
  private static readonly RATE_LIMIT = 5;
  private static readonly TTL = 120000; // 2 minutes in ms

  protected async getTracker(context: ExecutionContext): Promise<string> {
    try {
      const request = this.getRequest(context);
      const email = request.body?.email;

      if (!email) {
        throw new Error("Email is required for rate limiting");
      }
      return email;
    } catch (err) {
      // Fallback to IP-based tracking if email extraction fails
      return super.getTracker(context);
    }
  }

  protected getLimit(): number {
    return EmailRateLimitGuard.RATE_LIMIT;
  }

  protected getTtl(): number {
    return EmailRateLimitGuard.TTL;
  }

  protected async throwThrottlingException(
    context: ExecutionContext
  ): Promise<void> {
    let email = "unknown email";
    const retryAfter = Math.ceil(EmailRateLimitGuard.TTL / 1000);

    try {
      const request = this.getRequest(context);
      email = request.body?.email || email;

      const response = context.switchToHttp().getResponse();
      if (response?.header) {
        response.header("Retry-After", retryAfter.toString());
      }
    } catch (err) {
      console.error("Error setting rate limit headers:", err);
    }

    // Throw our custom exception that will maintain consistent formatting
    throw new RateLimitExceededException(
      `Too many login attempts for ${email}. Please try again in ${retryAfter} seconds.`,
      429,
      retryAfter
    );
  }

  private getRequest(context: ExecutionContext): { body: any } {
    if (typeof context.switchToHttp !== "function") {
      throw new Error("Invalid execution context - cannot switch to HTTP");
    }

    const httpContext = context.switchToHttp();
    if (!httpContext) {
      throw new Error("Could not get HTTP context");
    }

    const request = httpContext.getRequest();
    if (!request?.body) {
      throw new Error("Could not get request object");
    }

    return request;
  }
}
