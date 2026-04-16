'use client'

import type { Dispatch, SetStateAction } from 'react'
import { useExtracted } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import SettingsAccordionSection from './SettingsAccordionSection'

interface LegalSectionProps {
  isPending: boolean
  isRemovingTermsOfServicePdf: boolean
  openSections: string[]
  onToggleSection: (value: string) => void
  selectedTermsOfServicePdfFile: File | null
  setSelectedTermsOfServicePdfFile: Dispatch<SetStateAction<File | null>>
  hasUploadedTermsOfServicePdf: boolean
  initialTermsOfServicePdfUrl: string | null
  onRemoveTermsOfServicePdf: () => void
}

function LegalSection({
  isPending,
  isRemovingTermsOfServicePdf,
  openSections,
  onToggleSection,
  selectedTermsOfServicePdfFile,
  setSelectedTermsOfServicePdfFile,
  hasUploadedTermsOfServicePdf,
  initialTermsOfServicePdfUrl,
  onRemoveTermsOfServicePdf,
}: LegalSectionProps) {
  const t = useExtracted()

  return (
    <SettingsAccordionSection
      value="legal"
      isOpen={openSections.includes('legal')}
      onToggle={onToggleSection}
      header={<h3 className="text-base font-medium">{t('Legal')}</h3>}
    >
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="terms-of-service-pdf">{t('Terms of Use PDF')}</Label>
          <Input
            id="terms-of-service-pdf"
            type="file"
            name="tos_pdf"
            accept="application/pdf"
            disabled={isPending || isRemovingTermsOfServicePdf}
            onChange={(event) => {
              const file = event.target.files?.[0] ?? null
              setSelectedTermsOfServicePdfFile(file)
            }}
          />
          <p className="text-xs text-muted-foreground">
            {t('Upload a PDF to replace the default /tos page content. PDF only, up to 2MB.')}
          </p>
        </div>

        {selectedTermsOfServicePdfFile
          ? (
              <p className="text-xs text-muted-foreground">
                {t('Selected file:')}
                {' '}
                {selectedTermsOfServicePdfFile.name}
              </p>
            )
          : null}

        {hasUploadedTermsOfServicePdf
          && (
            <div className="
              flex flex-col gap-3 rounded-xl border border-border/60 bg-muted/10 p-4
              sm:flex-row sm:items-center sm:justify-between
            "
            >
              <div className="grid gap-1">
                <p className="text-sm font-medium">{t('An uploaded Terms of Use PDF is currently active on /tos.')}</p>
                <a
                  href={initialTermsOfServicePdfUrl ?? '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground underline underline-offset-2"
                >
                  {t('Open current PDF')}
                </a>
              </div>

              <Button
                type="button"
                variant="outline"
                disabled={isPending || isRemovingTermsOfServicePdf}
                onClick={onRemoveTermsOfServicePdf}
              >
                {isRemovingTermsOfServicePdf ? t('Removing...') : t('Remove uploaded PDF')}
              </Button>
            </div>
          )}
      </div>
    </SettingsAccordionSection>
  )
}

export default LegalSection
