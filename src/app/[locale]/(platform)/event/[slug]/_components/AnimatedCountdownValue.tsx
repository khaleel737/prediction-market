'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { clampCountdownDigit } from '../_utils/eventLiveSeriesChartUtils'

function RollingCountdownDigit({ digit }: { digit: number }) {
  const nextDigit = clampCountdownDigit(digit)
  const [currentDigit, setCurrentDigit] = useState(() => nextDigit)
  const [previousDigit, setPreviousDigit] = useState<number | null>(null)
  const [isAnimating, setIsAnimating] = useState(false)

  if (nextDigit !== currentDigit) {
    setPreviousDigit(currentDigit)
    setCurrentDigit(nextDigit)
    setIsAnimating(true)
  }

  function handleDigitTransitionEnd() {
    if (!isAnimating) {
      return
    }

    setIsAnimating(false)
    setPreviousDigit(null)
  }

  return (
    <span className="relative inline-flex h-[1em] w-[0.72em] overflow-hidden">
      {previousDigit !== null && (
        <span
          className={cn(
            'absolute inset-0 flex items-center justify-center transition-all duration-200 ease-out',
            isAnimating ? '-translate-y-full opacity-0' : 'translate-y-0 opacity-100',
          )}
        >
          {previousDigit}
        </span>
      )}
      <span
        className={cn(
          'absolute inset-0 flex items-center justify-center transition-all duration-200 ease-out',
          previousDigit === null
            ? 'translate-y-0 opacity-100'
            : isAnimating
              ? 'translate-y-0 opacity-100'
              : 'translate-y-full opacity-0',
        )}
        onTransitionEnd={handleDigitTransitionEnd}
      >
        {currentDigit}
      </span>
    </span>
  )
}

export default function AnimatedCountdownValue({ value }: { value: number }) {
  const safeValue = Math.max(0, Math.floor(value))
  const digits = safeValue.toString().padStart(2, '0').split('')

  return (
    <span className="inline-flex items-center leading-none tabular-nums">
      {digits.map((digit, index) => (
        <RollingCountdownDigit
          key={index}
          digit={Number(digit)}
        />
      ))}
    </span>
  )
}
