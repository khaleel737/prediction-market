'use client'

import type { Dispatch, SetStateAction } from 'react'
import { useExtracted } from 'next-intl'
import AllowedMarketCreatorsManager from '@/app/[locale]/admin/(general)/_components/AllowedMarketCreatorsManager'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import SettingsAccordionSection from './SettingsAccordionSection'

interface MarketFeeSectionProps {
  isPending: boolean
  openSections: string[]
  onToggleSection: (value: string) => void
  feeRecipientWallet: string
  setFeeRecipientWallet: Dispatch<SetStateAction<string>>
}

function MarketFeeSection({
  isPending,
  openSections,
  onToggleSection,
  feeRecipientWallet,
  setFeeRecipientWallet,
}: MarketFeeSectionProps) {
  const t = useExtracted()

  return (
    <SettingsAccordionSection
      value="market-fees"
      isOpen={openSections.includes('market-fees')}
      onToggle={onToggleSection}
      header={<h3 className="text-base font-medium">{t('Market and fee settings')}</h3>}
    >
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="theme-fee-recipient-wallet">{t('Your Polygon wallet address to receive transaction fees')}</Label>
          <Input
            id="theme-fee-recipient-wallet"
            name="fee_recipient_wallet"
            maxLength={42}
            value={feeRecipientWallet}
            onChange={event => setFeeRecipientWallet(event.target.value)}
            disabled={isPending}
            placeholder={t('0xabc')}
          />
        </div>

        <AllowedMarketCreatorsManager disabled={isPending} />
      </div>
    </SettingsAccordionSection>
  )
}

export default MarketFeeSection
