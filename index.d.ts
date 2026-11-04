declare namespace userAgents {
  interface RedisClient {
    zincrby(key: string, increment: number, member: string): Promise<string>
    zrange(key: string, start: number, ...args: any[]): Promise<string[]>
    del(key: string): Promise<number>
  }

  interface ScriptingRedisClient extends RedisClient {
    defineCommand(name: string, definition: { numberOfKeys?: number, lua: string }): void
  }

  interface Options {
    window?: number
  }

  interface TopOptions {
    withScore?: boolean
  }

  type TopResult = [userAgent: string, count: number]

  type ClientId = string | null | undefined

  type IncrResult = Promise<string | null> | false

  interface UserAgentsReader {
    /**
     * Get the top N user agents by count.
     * @param n - Number of top user agents to return (default: 10)
     * @param options - Options for the query
     * @returns Array of user agents, or tuples of [userAgent, count] if withScore is true
     */
    top(n?: number, options?: { withScore?: false }): Promise<string[]>
    top(n: number | undefined, options: { withScore: true }): Promise<TopResult[]>
    top(n?: number, options?: TopOptions): Promise<string[] | TopResult[]>

    /**
     * Flush all user agent data from Redis.
     * @returns Promise that resolves when data is flushed
     */
    flush: () => Promise<number>
  }

  interface BasicUserAgentsAPI extends UserAgentsReader {
    incr: (userAgent: string | null | undefined) => IncrResult
  }

  interface UserAgentsAPI extends UserAgentsReader {
    incr: (userAgent: string | null | undefined, clientId?: ClientId) => IncrResult
  }
}

/**
 * Create a user agents tracking API backed by Redis.
 * @param redis - An ioredis instance
 * @returns UserAgentsAPI interface
 */
declare function userAgents(redis: userAgents.ScriptingRedisClient, options?: userAgents.Options): userAgents.UserAgentsAPI
declare function userAgents(redis: userAgents.RedisClient, options?: userAgents.Options): userAgents.BasicUserAgentsAPI

declare namespace userAgents {
  function isBrowser(userAgent: unknown): boolean
}

export = userAgents
