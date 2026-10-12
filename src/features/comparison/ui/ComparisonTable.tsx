import { Link } from 'react-router-dom'
import type { Perfume } from '@/entities/perfume'
import type { ComparisonAnalysis } from '@/features/comparison'
import { perfumeDetailsPath } from '@/shared/constants/routes'
import { Button } from '@/shared/ui/Button'
import styles from './ComparisonTable.module.css'

type ComparisonTableProps = {
  items: Perfume[]
  analysis: ComparisonAnalysis
  onRemove: (perfumeId: number) => void
}

const CHARACTERISTIC_LABELS: Record<string, string> = {
  Sweetness: 'Солодкість',
  Freshness: 'Свіжість',
  Woody: 'Деревність',
  Spicy: 'Пряність',
  Citrus: 'Цитрус',
  Floral: 'Квітковість',
  Fruity: 'Фруктовість',
  Powdery: 'Пудра',
  Smoky: 'Димність',
  Oriental: 'Орієнтал',
}

function formatPrice(value: number | null): string {
  if (value == null) return '—'
  return new Intl.NumberFormat('uk-UA', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(value)
}

function formatNumber(value: number | null, digits = 1): string {
  if (value == null) return '—'
  return value.toFixed(digits)
}

function formatYear(value: number | null): string {
  if (value == null) return '—'
  return String(Math.trunc(value))
}

function cellClass(isCommon: boolean): string {
  return isCommon ? styles.common : styles.diff
}

export function ComparisonTable({ items, analysis, onRemove }: ComparisonTableProps) {
  const columns = items.length

  return (
    <div className={styles.scroll}>
      <table className={styles.table}>
        <caption className={styles.caption}>Порівняння характеристик парфумів</caption>
        <thead>
          <tr>
            <th scope="col" className={styles.rowLabel}>
              Характеристика
            </th>
            {items.map((perfume) => (
              <th key={perfume.id} scope="col" className={styles.perfumeHead}>
                <div className={styles.headContent}>
                  <span className={styles.brand}>{perfume.brand.name}</span>
                  <Link to={perfumeDetailsPath(perfume.id)} className={styles.name}>
                    {perfume.name}
                  </Link>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => onRemove(perfume.id)}
                  >
                    Прибрати
                  </Button>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <th scope="row">Бренд</th>
            {analysis.brand.values.map((value, index) => (
              <td key={items[index]?.id ?? index} className={cellClass(analysis.brand.isCommon)}>
                {value ?? '—'}
              </td>
            ))}
          </tr>
          <tr>
            <th scope="row">Тип</th>
            {analysis.fragranceType.values.map((value, index) => (
              <td
                key={items[index]?.id ?? index}
                className={cellClass(analysis.fragranceType.isCommon)}
              >
                {value ?? '—'}
              </td>
            ))}
          </tr>
          <tr>
            <th scope="row">Рік</th>
            {analysis.releaseYear.values.map((value, index) => (
              <td
                key={items[index]?.id ?? index}
                className={cellClass(analysis.releaseYear.isCommon)}
              >
                {formatYear(value)}
              </td>
            ))}
          </tr>
          <tr>
            <th scope="row">Концентрація</th>
            {analysis.concentration.values.map((value, index) => (
              <td
                key={items[index]?.id ?? index}
                className={cellClass(analysis.concentration.isCommon)}
              >
                {value ?? '—'}
              </td>
            ))}
          </tr>
          <tr>
            <th scope="row">Gender</th>
            {analysis.gender.values.map((value, index) => (
              <td key={items[index]?.id ?? index} className={cellClass(analysis.gender.isCommon)}>
                {value ?? '—'}
              </td>
            ))}
          </tr>
          <tr>
            <th scope="row">Ціна</th>
            {analysis.price.values.map((value, index) => (
              <td key={items[index]?.id ?? index} className={cellClass(analysis.price.isCommon)}>
                {formatPrice(value)}
              </td>
            ))}
          </tr>
          <tr>
            <th scope="row">Рейтинг</th>
            {analysis.rating.values.map((value, index) => (
              <td key={items[index]?.id ?? index} className={cellClass(analysis.rating.isCommon)}>
                {formatNumber(value)}
              </td>
            ))}
          </tr>
          <tr>
            <th scope="row">Ноти</th>
            {items.map((perfume) => (
              <td key={perfume.id}>
                {perfume.notes.length > 0
                  ? perfume.notes.map((note) => note.name).join(', ')
                  : '—'}
              </td>
            ))}
          </tr>
          <tr>
            <th scope="row">Сезони</th>
            {items.map((perfume) => (
              <td key={perfume.id}>
                {perfume.seasons.length > 0
                  ? perfume.seasons.map((season) => season.name).join(', ')
                  : '—'}
              </td>
            ))}
          </tr>
          {analysis.characteristics.map((field) => (
            <tr key={field.name}>
              <th scope="row">{CHARACTERISTIC_LABELS[field.name] ?? field.name}</th>
              {Array.from({ length: columns }, (_, index) => (
                <td key={items[index]?.id ?? index} className={cellClass(field.isCommon)}>
                  {field.values[index] == null ? '—' : String(field.values[index])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
