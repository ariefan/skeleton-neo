'use client'

import { createORPCReactQueryUtils, RouterUtils } from '@orpc/react-query'
import { RouterClient } from '@orpc/server'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createContext, useContext, useState } from 'react'
import { orpcClient } from './client'
import type { AppRouter } from './server'

export const ORPCContext = createContext<any>(undefined)

export function useORPC(): RouterUtils<RouterClient<AppRouter>> {
  const orpc = useContext(ORPCContext)
  if (!orpc) {
    throw new Error('useORPC must be used within an RPCProvider')
  }
  return orpc as any
}

export function RPCProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())
  const [orpc] = useState(() => createORPCReactQueryUtils(orpcClient as any))

  return (
    <ORPCContext.Provider value={orpc}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </ORPCContext.Provider>
  )
}
