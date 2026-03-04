import { Redis } from 'ioredis'

export interface TopOptions {
  withScore?: boolean
}

export interface TopResult {
  userAgent: string
  count?: number
}

export interface UserAgentsAPI {
  /**
   * Increment the count for a user agent string.
   * @param userAgent - The user agent string to track
   * @returns Returns 1 if incremented, 0 if skipped (bot detected or null input)
   */
  incr: (userAgent: string) => Promise<number>

  /**
   * Get the top N user agents by count.
   * @param n - Number of top user agents to return (default: 10)
   * @param options - Options for the query
   * @returns Array of user agents, or tuples of [userAgent, count] if withScore is true
   */
  top: (n?: number, options?: TopOptions) => Promise<string[] | TopResult[]>

  /**
   * Flush all user agent data from Redis.
   * @returns Promise that resolves when data is flushed
   */
  flush: () => Promise<number>
}

/**
 * Create a user agents tracking API backed by Redis.
 * @param redis - An ioredis instance
 * @returns UserAgentsAPI interface
 */
export default function userAgents(redis: Redis): UserAgentsAPI
