import { getServerSession } from "next-auth/next"
import { authOptions } from "./auth"
import { NextResponse } from "next/server"

export type AuthedRequest = Response & {
  user: {
    sub: string
    email: string
    name?: string
  }
}

export function withAuth(handler: (req: any) => Promise<Response>) {
  return async (req: Request) => {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Cast req as any to attach user object (common pattern for Next.js auth wrappers)
    const authedReq = req as any
    authedReq.user = {
      sub: (session.user as any).id,
      email: session.user.email!,
      name: session.user.name!,
    }

    return handler(authedReq)
  }
}
