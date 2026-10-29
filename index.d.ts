declare namespace userAgents {
  interface RedisClient {
    zincrby(key: string, increment: number, member: string): Promise<string>
    zrange(key: string, start: number, ...args: any[]): Promise<string[]>
    del(key: string): Promise<number>
  }

  interface TopOptions {
    withScore?: boolean
  }

  type TopResult = [userAgent: string, count: number]

  interface UserAgentsAPI {
    /**
     * Increment the count for a user agent string.
     * @param userAgent - The user agent string to track
     * @returns The new count as Redis replies it, or the falsy input or `false` when skipped (bot detected or empty input)
     */
    incr: (userAgent: string | null | undefined) => Promise<string> | false | '' | null | undefined

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
}

/**
 * Create a user agents tracking API backed by Redis.
 * @param redis - An ioredis instance
 * @returns UserAgentsAPI interface
 */
declare function userAgents(redis: userAgents.RedisClient): userAgents.UserAgentsAPI

export = userAgents
