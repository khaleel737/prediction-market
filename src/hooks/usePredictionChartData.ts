import type { MutableRefObject } from 'react'
import type { DataPoint } from '@/types/PredictionChartTypes'
import { useLayoutEffect, useRef, useState } from 'react'
import { arePointsEqual } from '@/lib/prediction-chart'

export function usePredictionChartData(
  providedData: DataPoint[] | undefined,
  normalizedSignature: string | number,
) {
  const [data, setData] = useState<DataPoint[]>([])
  const [isClient, setIsClient] = useState(false)
  const dataSignatureRef = useRef<string | number | null>(null)
  const lastDataUpdateTypeRef = useRef<'reset' | 'append' | 'none'>('reset')
  const previousDataRef = useRef<DataPoint[] | null>(null)

  useLayoutEffect(function initializeClient() {
    queueMicrotask(() => {
      setIsClient(true)
    })
  }, [])

  useLayoutEffect(function syncProvidedData() {
    if (!isClient) {
      return
    }

    if (!providedData || providedData.length === 0) {
      dataSignatureRef.current = normalizedSignature
      queueMicrotask(() => {
        setData([])
      })
      lastDataUpdateTypeRef.current = 'reset'
      return
    }

    setData((previousData) => {
      const signatureChanged = dataSignatureRef.current !== normalizedSignature
      if (signatureChanged) {
        dataSignatureRef.current = normalizedSignature
        lastDataUpdateTypeRef.current = 'reset'
        return providedData
      }

      if (previousData.length === 0) {
        lastDataUpdateTypeRef.current = 'reset'
        return providedData
      }

      const previousFirst = previousData[0]?.date?.getTime?.()
      const previousLast = previousData.at(-1)?.date?.getTime?.()
      const incomingFirst = providedData[0]?.date?.getTime?.()
      const incomingLast = providedData.at(-1)?.date?.getTime?.()

      const timelineValues = [previousFirst, previousLast, incomingFirst, incomingLast]
      const hasInvalidTimeline = timelineValues.some(
        value => typeof value !== 'number' || !Number.isFinite(value),
      )

      if (hasInvalidTimeline) {
        lastDataUpdateTypeRef.current = 'reset'
        return providedData
      }

      if (
        typeof incomingLast === 'number'
        && typeof previousLast === 'number'
        && incomingLast < previousLast
      ) {
        lastDataUpdateTypeRef.current = 'reset'
        return providedData
      }

      if (
        typeof incomingFirst === 'number'
        && typeof previousFirst === 'number'
        && incomingFirst < previousFirst
      ) {
        lastDataUpdateTypeRef.current = 'reset'
        return providedData
      }

      let nextData = previousData
      let didTrim = false

      if (
        typeof incomingFirst === 'number'
        && typeof previousFirst === 'number'
        && incomingFirst > previousFirst
      ) {
        const firstIndexToKeep = previousData.findIndex(point => point.date.getTime() >= incomingFirst)
        if (firstIndexToKeep === -1) {
          nextData = []
          didTrim = previousData.length > 0
        }
        else if (firstIndexToKeep > 0) {
          nextData = previousData.slice(firstIndexToKeep)
          didTrim = true
        }
      }

      const latestNextPoint = nextData.length > 0 ? (nextData.at(-1) ?? null) : null
      const lastTimestamp = latestNextPoint
        ? latestNextPoint.date.getTime()
        : null

      const appendedPoints = providedData.filter((point) => {
        const timestamp = point.date.getTime()
        if (!Number.isFinite(timestamp)) {
          return false
        }

        if (lastTimestamp === null) {
          return true
        }

        return timestamp > lastTimestamp
      })

      if (appendedPoints.length > 0) {
        lastDataUpdateTypeRef.current = 'append'
        return [...nextData, ...appendedPoints]
      }

      if (didTrim) {
        lastDataUpdateTypeRef.current = 'append'
        return nextData
      }

      if (lastTimestamp !== null && nextData.length > 0) {
        const latestPoint = nextData.at(-1)
        const incomingLatestPoint = providedData.at(-1)
        if (
          latestPoint
          && incomingLatestPoint
          && incomingLatestPoint.date.getTime() === lastTimestamp
          && !arePointsEqual(latestPoint, incomingLatestPoint)
        ) {
          lastDataUpdateTypeRef.current = 'append'
          return [...nextData.slice(0, -1), incomingLatestPoint]
        }
      }

      lastDataUpdateTypeRef.current = 'none'
      return previousData
    })
  }, [providedData, normalizedSignature, isClient])

  return {
    data,
    isClient,
    lastDataUpdateTypeRef: lastDataUpdateTypeRef as MutableRefObject<'reset' | 'append' | 'none'>,
    previousDataRef: previousDataRef as MutableRefObject<DataPoint[] | null>,
  }
}

export default usePredictionChartData
