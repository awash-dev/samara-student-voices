import { neon, neonConfig } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema'

// Clean database URL for HTTP serverless proxy (strip channel_binding if present)
const rawUrl = process.env.DATABASE_URL || ''
const cleanDatabaseUrl = rawUrl
  .replace('&channel_binding=require', '')
  .replace('channel_binding=require&', '')
  .replace('?channel_binding=require', '')

// Custom retry fetch to seamlessly handle Neon compute cold-starts
const fetchWithRetry: typeof fetch = async (input, init) => {
  let attempts = 0
  const maxAttempts = 4

  while (attempts < maxAttempts) {
    try {
      attempts++
      return await fetch(input, init)
    } catch (err: any) {
      if (attempts >= maxAttempts) throw err
      const backoff = Math.min(attempts * 600, 2000)
      console.warn(
        `[Neon DB] Cold-start/fetch attempt ${attempts} failed (${err?.message || err}). Retrying in ${backoff}ms...`
      )
      await new Promise((resolve) => setTimeout(resolve, backoff))
    }
  }

  return fetch(input, init)
}

neonConfig.fetchFunction = fetchWithRetry

export const sql = neon(cleanDatabaseUrl)
export const db = drizzle(sql, { schema })

export * from './schema'
