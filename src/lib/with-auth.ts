import { getToken } from "next-auth/jwt"
import { NextResponse } from "next/server"

export type AuthedRequest = Request & {
  user: {
    sub: string
    email: string
    name?: string
  }
}

export function withAuth(handler: (req: AuthedRequest, context: any) => Promise<Response>) {
  return async (req: Request, context: any) => {
    const token = await getToken({
      req: req as any,
      secret: process.env.NEXTAUTH_SECRET || "development_secret_only_for_dev_mode"
    })

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Cast req as any to attach user object
    const authedReq = req as any
    authedReq.user = {
      sub: (token.id || token.sub) as string,
      email: token.email as string,
      name: token.name as string,
    }

    return handler(authedReq, context)
  }
}
