import { HttpException, Injectable, ServiceUnavailableException } from '@nestjs/common'
import Redis from 'ioredis'
import { randomUUID } from 'crypto'

interface RateLimitConfig {
  limit: number
  windowMs: number
  scope: string
}

interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: number
}

const RATE_LIMIT_SCRIPT = `
local key = KEYS[1]
local now = tonumber(ARGV[1])
local windowMs = tonumber(ARGV[2])
local limit = tonumber(ARGV[3])
local member = ARGV[4]

redis.call('ZREMRANGEBYSCORE', key, 0, now - windowMs)
local count = redis.call('ZCARD', key)

if count >= limit then
  local oldest = redis.call('ZRANGE', key, 0, 0, 'WITHSCORES')
  local resetAt = now + windowMs
  if oldest[2] then
    resetAt = tonumber(oldest[2]) + windowMs
  end
  return {0, count, resetAt}
end

redis.call('ZADD', key, now, member)
redis.call('PEXPIRE', key, windowMs)
return {1, count + 1, now + windowMs}
`

@Injectable()
export class RateLimitService {
  private readonly redis = new Redis(process.env.REDIS_URL || 'redis://127.0.0.1:6379', {
    lazyConnect: true,
    maxRetriesPerRequest: 1,
  })

  private buildKey(scope: string, identity: string) {
    return `rate-limit:${scope}:${identity}`
  }

  private async consume(scope: string, identity: string, config: RateLimitConfig): Promise<RateLimitResult> {
    try {
      if (this.redis.status === 'wait' || this.redis.status === 'end') {
        await this.redis.connect().catch(() => {})
      }

      const key = this.buildKey(scope, identity)
      const result = await this.redis.eval(
        RATE_LIMIT_SCRIPT,
        1,
        key,
        Date.now().toString(),
        config.windowMs.toString(),
        config.limit.toString(),
        randomUUID(),
      )

      const [allowed, remaining, resetAt] = result as [number, number, number]
      return {
        allowed: allowed === 1,
        remaining,
        resetAt,
      }
    } catch {
      throw new ServiceUnavailableException('限流服务不可用')
    }
  }

  async assertAllowed(scope: string, identity: string, config: Omit<RateLimitConfig, 'scope'>) {
    const result = await this.consume(scope, identity, { ...config, scope })
    if (!result.allowed) {
      const retryAfter = Math.max(1, Math.ceil((result.resetAt - Date.now()) / 1000))
      throw new HttpException(
        {
          message: '请求过于频繁，请稍后再试',
          retryAfter,
        },
        429,
      )
    }

    return result
  }

  async onModuleDestroy() {
    await this.redis.quit().catch(() => {})
  }
}
