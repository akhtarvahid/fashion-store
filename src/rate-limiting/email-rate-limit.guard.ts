import { Injectable } from "@nestjs/common";
import { ThrottlerException, ThrottlerGuard } from "@nestjs/throttler";

@Injectable()
export class EmailRateLimitGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, any>): Promise<string> {
    return req.body?.email || "anonymous";
  }

  protected async getLimit(): Promise<number> {
    return Promise.resolve(5);
  }
  protected async getTtl(): Promise<number> {
    return Promise.resolve(60000);
  }
  protected async throwThrottlingException(): Promise<void> {
    throw new ThrottlerException(
      `Too many login attempts for email. Please try again later.`
    );
  }
}
