'use client'

import { ShieldAlertIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface GeoBlockingOverlayProps {
  blockedCountries: string[]
  message: string
  customGeoHeader: string
}

function useGeoBlockingCheck(blockedCountries: string[], customGeoHeader: string) {
  const [isBlocked, setIsBlocked] = useState(false)

  useEffect(function checkGeoBlocking() {
    if (blockedCountries.length === 0) {
      return
    }

    const url = customGeoHeader
      ? `/api/geo?header=${encodeURIComponent(customGeoHeader)}`
      : '/api/geo'

    fetch(url)
      .then(response => response.json())
      .then((data: { country: string | null }) => {
        if (data.country && blockedCountries.includes(data.country)) {
          setIsBlocked(true)
        }
      })
      .catch(() => {})
  }, [blockedCountries, customGeoHeader])

  return isBlocked
}

export default function GeoBlockingOverlay({
  blockedCountries,
  message,
  customGeoHeader,
}: GeoBlockingOverlayProps) {
  const isBlocked = useGeoBlockingCheck(blockedCountries, customGeoHeader)

  if (!isBlocked) {
    return null
  }

  const displayMessage = message.trim() || 'This platform is not available in your region.'

  return (
    <Dialog open modal>
      <DialogContent
        showCloseButton={false}
        onPointerDownOutside={event => event.preventDefault()}
        onEscapeKeyDown={event => event.preventDefault()}
        onInteractOutside={event => event.preventDefault()}
        className="sm:max-w-md"
      >
        <DialogHeader className="items-center text-center sm:text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10">
            <ShieldAlertIcon className="size-6 text-destructive" />
          </div>
          <DialogTitle>Region Restricted</DialogTitle>
          <DialogDescription className="text-balance">
            {displayMessage}
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}
