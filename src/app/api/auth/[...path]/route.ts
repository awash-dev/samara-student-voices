import { auth } from '@/lib/auth/server'

const baseHandlers = auth.handler()

function getNeonOrigin(): string | null {
  const baseUrl = process.env.NEON_AUTH_BASE_URL
  if (!baseUrl) return null
  try {
    return new URL(baseUrl).origin
  } catch {
    return null
  }
}

async function prepareProxiedRequest(request: Request): Promise<Request> {
  const neonOrigin = getNeonOrigin()
  if (!neonOrigin) return request

  const headers = new Headers(request.headers)

  // Neon Auth (Managed Better Auth) enforces strict Origin checking against its
  // configured "Trusted Domains". Rewriting Origin to Neon Auth's own base origin
  // ensures the server-side Next.js BFF proxy is never rejected with 403 Forbidden (INVALID_ORIGIN).
  headers.set('origin', neonOrigin)

  const referer = headers.get('referer')
  if (referer) {
    try {
      const refUrl = new URL(referer)
      headers.set('referer', `${neonOrigin}${refUrl.pathname}${refUrl.search}`)
    } catch {
      headers.set('referer', neonOrigin)
    }
  }

  if (request.method === 'GET' || request.method === 'HEAD') {
    return new Request(request.url, {
      method: request.method,
      headers,
    })
  }

  const body = await request.arrayBuffer()
  if (body.byteLength === 0) {
    return new Request(request.url, {
      method: request.method,
      headers,
    })
  }

  return new Request(request.url, {
    method: request.method,
    headers,
    body,
    // @ts-ignore - duplex is standard in Node 18+ fetch
    duplex: 'half',
  })
}

async function wrapHandler(
  handler: (req: Request, ctx: { params: Promise<{ path: string[] }> }) => Promise<Response>,
  request: Request,
  ctx: { params: Promise<{ path: string[] }> }
): Promise<Response> {
  try {
    const proxiedReq = await prepareProxiedRequest(request)
    const response = await handler(proxiedReq, ctx)

    if (response.status === 403) {
      const clone = response.clone()
      const text = await clone.text().catch(() => '')
      if (text.includes('INVALID_ORIGIN') || text.includes('INVALID_CALLBACKURL')) {
        console.warn(`[Neon Auth Proxy] Upstream 403 notice: ${text}`)
      }
    }

    return response
  } catch (error) {
    console.error('[Neon Auth Proxy Error]:', error)
    return Response.json(
      {
        error: error instanceof Error ? error.message : 'Authentication service error',
        code: 'AUTH_PROXY_ERROR',
      },
      { status: 500 }
    )
  }
}

export async function GET(req: Request, ctx: { params: Promise<{ path: string[] }> }) {
  return wrapHandler(baseHandlers.GET, req, ctx)
}

export async function POST(req: Request, ctx: { params: Promise<{ path: string[] }> }) {
  return wrapHandler(baseHandlers.POST, req, ctx)
}

export async function PUT(req: Request, ctx: { params: Promise<{ path: string[] }> }) {
  return wrapHandler(baseHandlers.PUT, req, ctx)
}

export async function DELETE(req: Request, ctx: { params: Promise<{ path: string[] }> }) {
  return wrapHandler(baseHandlers.DELETE, req, ctx)
}

export async function PATCH(req: Request, ctx: { params: Promise<{ path: string[] }> }) {
  return wrapHandler(baseHandlers.PATCH, req, ctx)
}
