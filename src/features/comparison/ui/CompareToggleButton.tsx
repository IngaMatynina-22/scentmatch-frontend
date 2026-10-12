import { COMPARE_MAX_ITEMS, useComparison } from '@/features/comparison'
import type { CompareSelectionItem } from '@/features/comparison'
import { Button } from '@/shared/ui/Button'

type CompareToggleButtonProps = {
  perfume: CompareSelectionItem
  size?: 'sm' | 'md'
  fullWidth?: boolean
}

export function CompareToggleButton({
  perfume,
  size = 'sm',
  fullWidth = false,
}: CompareToggleButtonProps) {
  const { isSelected, add, remove, canAddMore } = useComparison()
  const selected = isSelected(perfume.id)

  if (selected) {
    return (
      <Button
        type="button"
        size={size}
        variant="ghost"
        fullWidth={fullWidth}
        onClick={() => remove(perfume.id)}
        aria-pressed="true"
      >
        Прибрати з порівняння
      </Button>
    )
  }

  return (
    <Button
      type="button"
      size={size}
      variant="accent"
      fullWidth={fullWidth}
      disabled={!canAddMore}
      onClick={() => add(perfume)}
      aria-pressed="false"
      title={
        canAddMore
          ? 'Додати до порівняння'
          : `Можна порівняти щонайбільше ${COMPARE_MAX_ITEMS} парфумів`
      }
    >
      {canAddMore ? 'До порівняння' : `Ліміт ${COMPARE_MAX_ITEMS}`}
    </Button>
  )
}
