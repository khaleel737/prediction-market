'use client'

import type { AdminThemeSettingsFormProps } from '@/app/[locale]/admin/theme/_components/admin-theme-utils'
import { useMemo } from 'react'
import AdminThemeSettingsFormInner from '@/app/[locale]/admin/theme/_components/AdminThemeSettingsFormInner'

export default function AdminThemeSettingsForm(props: AdminThemeSettingsFormProps) {
  const formResetKey = useMemo(() => JSON.stringify({
    presetOptions: props.presetOptions,
    initialThemeSettings: props.initialThemeSettings,
    initialThemeSiteSettings: props.initialThemeSiteSettings,
  }), [
    props.presetOptions,
    props.initialThemeSettings,
    props.initialThemeSiteSettings,
  ])

  return <AdminThemeSettingsFormInner key={formResetKey} {...props} />
}
