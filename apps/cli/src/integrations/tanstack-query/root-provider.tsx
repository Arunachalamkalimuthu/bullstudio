import { QueryClient } from '@tanstack/react-query'
import superjson from 'superjson'
import { createTRPCClient, httpBatchStreamLink } from '@trpc/client'
import { createTRPCOptionsProxy } from '@trpc/tanstack-react-query'

import type { TRPCRouter } from '@/integrations/trpc/router'

import { TRPCProvider } from '@/integrations/trpc/react'

function getUrl() {
  if (typeof window !== 'undefined') {
    return `${window.__BULLSTUDIO_BASE_PATH__ ?? ''}/api/trpc`
  }
  return '/api/trpc'
}

/**
 * During SSR, call the TRPC router directly in-process instead of
 * making HTTP loopback requests. This avoids port/base-path issues
 * when bullstudio is mounted as middleware in a host app.
 */
const serverFetch: typeof globalThis.fetch = async (input, init) => {
  const [{ fetchRequestHandler }, { trpcRouter }] = await Promise.all([
    import('@trpc/server/adapters/fetch'),
    import('@/integrations/trpc/router'),
  ])
  return fetchRequestHandler({
    req: new Request(input, init),
    router: trpcRouter,
    endpoint: '/api/trpc',
  })
}

export const trpcClient = createTRPCClient<TRPCRouter>({
  links: [
    httpBatchStreamLink({
      transformer: superjson,
      url: getUrl(),
      fetch: typeof window === 'undefined' ? serverFetch : undefined,
    }),
  ],
})

export function getContext() {
  const queryClient = new QueryClient({
    defaultOptions: {
      dehydrate: { serializeData: superjson.serialize },
      hydrate: { deserializeData: superjson.deserialize },
    },
  })

  const serverHelpers = createTRPCOptionsProxy({
    client: trpcClient,
    queryClient: queryClient,
  })
  return {
    queryClient,
    trpc: serverHelpers,
  }
}

export function Provider({
  children,
  queryClient,
}: {
  children: React.ReactNode
  queryClient: QueryClient
}) {
  return (
    <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
      {children}
    </TRPCProvider>
  )
}
