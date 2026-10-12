import { useState } from 'react'
import { adminPlatformApi } from '@/features/admin/api/adminPlatformApi'
import type {
  CatalogImportRequest,
  CatalogImportResult,
  CatalogImportRow,
} from '@/features/admin/model/platformTypes'
import { getApiErrorMessage } from '@/shared/api/errorMessage'
import { Button } from '@/shared/ui/Button'
import { ErrorState } from '@/shared/ui/ErrorState'
import { PageContainer } from '@/shared/ui/PageContainer'
import styles from '../platform.module.css'

function parseJsonRows(text: string): CatalogImportRow[] {
  const parsed: unknown = JSON.parse(text)
  if (Array.isArray(parsed)) return parsed as CatalogImportRow[]
  if (
    parsed &&
    typeof parsed === 'object' &&
    'rows' in parsed &&
    Array.isArray((parsed as { rows: unknown }).rows)
  ) {
    return (parsed as { rows: CatalogImportRow[] }).rows
  }
  throw new Error('Очікується масив рядків або об’єкт { rows: [...] }.')
}

export function AdminCatalogImportPage() {
  const [rows, setRows] = useState<CatalogImportRow[] | null>(null)
  const [parseError, setParseError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<CatalogImportResult | null>(null)
  const [applied, setApplied] = useState<CatalogImportResult | null>(null)

  function onFile(file: File | null) {
    setParseError(null)
    setRows(null)
    setPreview(null)
    setApplied(null)
    if (!file) return
    if (!file.name.toLowerCase().endsWith('.json')) {
      setParseError('Для каталогу потрібен JSON (масив рядків).')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const text = String(reader.result ?? '')
        const parsed = parseJsonRows(text)
        if (parsed.length === 0) {
          setParseError('Файл не містить рядків.')
          return
        }
        setRows(parsed)
      } catch (err) {
        setParseError(
          err instanceof Error ? err.message : 'Некоректний JSON.',
        )
      }
    }
    reader.readAsText(file)
  }

  async function run(apply: boolean) {
    if (!rows || busy) return
    setBusy(true)
    setError(null)
    try {
      const payload: CatalogImportRequest = { apply, rows }
      const result = await adminPlatformApi.importCatalog(payload)
      if (apply) {
        setApplied(result)
        setPreview(null)
      } else {
        setPreview(result)
      }
    } catch (err) {
      setError(getApiErrorMessage(err, 'Не вдалося виконати імпорт каталогу.'))
    } finally {
      setBusy(false)
    }
  }

  function renderResult(result: CatalogImportResult) {
    return (
      <div className={styles.card}>
        <p className={styles.meta}>
          {result.applied ? 'Застосовано' : 'Попередній перегляд'} · рядків{' '}
          {result.totalRows} · створено {result.created} · оновлено{' '}
          {result.updated} · пропущено {result.skipped} · помилок {result.failed}
        </p>
        {result.rows.length > 0 ? (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>#</th>
                <th>Статус</th>
                <th>Повідомлення</th>
              </tr>
            </thead>
            <tbody>
              {result.rows.slice(0, 100).map((row) => (
                <tr key={row.index}>
                  <td>{row.index}</td>
                  <td>{row.status}</td>
                  <td>{row.message ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : null}
      </div>
    )
  }

  return (
    <PageContainer
      title="Масовий імпорт каталогу"
      description="Спочатку preview (apply=false), потім підтверджене застосування. Повний каталог не видаляється."
    >
      <p className={styles.notice}>
        Завантажте JSON з масивом рядків CatalogImportRow. Preview і apply —
        окремі запити.
      </p>
      <div className={styles.form}>
        <input
          type="file"
          accept=".json,application/json"
          onChange={(e) => onFile(e.target.files?.[0] ?? null)}
        />
        {parseError ? <p className={styles.error}>{parseError}</p> : null}
        {rows ? (
          <p className={styles.meta}>Рядків у файлі: {rows.length}</p>
        ) : null}
        <div className={styles.actions}>
          <Button
            type="button"
            variant="ghost"
            loading={busy}
            disabled={!rows}
            onClick={() => void run(false)}
          >
            Попередній перегляд
          </Button>
          <Button
            type="button"
            variant="accent"
            loading={busy}
            disabled={!preview}
            onClick={() => {
              if (
                window.confirm(
                  'Застосувати імпорт каталогу? Це виконає upsert рядків.',
                )
              ) {
                void run(true)
              }
            }}
          >
            Застосувати
          </Button>
        </div>
      </div>
      {error ? <ErrorState title="Помилка" message={error} /> : null}
      {preview ? renderResult(preview) : null}
      {applied ? renderResult(applied) : null}
    </PageContainer>
  )
}
