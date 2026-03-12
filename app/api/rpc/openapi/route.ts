import { OpenAPIHandler } from '@orpc/openapi'
import { router } from '@/lib/orpc/server'

const handler = new OpenAPIHandler(router)

export async function GET(request: Request) {
  const spec = await handler.generate({
    schema: {
      info: {
        title: 'Neo Vision API',
        version: '1.0.0',
        description: 'oRPC v1.x powered API for the Neo Vision Boilerplate.',
      },
    },
  })

  return Response.json(spec)
}
