'use client'

import type { AffiliateDataResult } from '@/lib/affiliate-data'
import { useEffect, useState } from 'react'
import { fetchAffiliateSettingsFromAPI } from '@/lib/affiliate-data'
import { ErrorDisplay } from './ErrorDisplay'

interface PlatformShareDisplayProps {
  showSymbol?: boolean
  className?: string
}

function useAffiliateData() {
  const [data, setData] = useState<AffiliateDataResult | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(function fetchAffiliateSettingsEffect() {
    fetchAffiliateSettingsFromAPI()
      .then(setData)
      .finally(() => setIsLoading(false))
  }, [])

  return { data, isLoading }
}

export function PlatformShareDisplay({
  showSymbol = true,
  className = 'font-semibold text-primary',
}: PlatformShareDisplayProps) {
  const { data, isLoading } = useAffiliateData()

  if (isLoading) {
    return (
      <span className={className}>
        Loading...
      </span>
    )
  }

  if (data && !data.success) {
    return (
      <ErrorDisplay
        error={data.error}
        className={className}
        showRefresh={true}
      />
    )
  }

  const platformSharePercent = data?.success
    ? data.data.platformSharePercent
    : 'N/A'

  return (
    <span className={className}>
      {platformSharePercent}
      {showSymbol ? '%' : ''}
    </span>
  )
}
