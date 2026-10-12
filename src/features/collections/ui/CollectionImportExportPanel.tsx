import { useState } from 'react'
import {
  COLLECTION_IMPORT_MAX_BYTES,
  collectionsApi,
  type CollectionImportResult,
} from '@/features/collections'
import { getApiErrorMessage } from '@/shared/api/errorMessage'
import { Button } from '@/shared/ui/Button'
import styles from '@/pages/platform.module.css'

type CollectionImportExportPanelProps = {
  onImported?: () => void
}

export function CollectionImportExportPanel({
  onImported,
}: CollectionImportExportPanelProps) {
  const [exporting, setExporting] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)
  const [exportOk, setExportOk] = useState<string | null>(null)

  const [file, setFile] = useState<File | null>(null)
  const [busy, setBusy] = useState(false)
  const [importError, setImportError] = useState<string | null>(null)
  const [preview, setPreview] = useState<CollectionImportResult | null>(null)
  const [applied, setApplied] = useState<CollectionImportResult | null>(null)

  async function handleExport(format: 'json' | 'csv') {
    if (exporting) return
    setExporting(true)
    setExportError(null)
    setExportOk(null)
    try {
      const { blob, fileName } = await collectionsApi.exportFile(format)
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = fileName
      anchor.click()
      URL.revokeObjectURL(url)
      setExportOk(`Завантажено: ${fileName}`)
    } catch (err) {
      setExportError(getApiErrorMessage(err, 'Не вдалося експортувати.'))
    } finally {
      setExporting(false)
    }
  }

  function validateFile(next: File | null): string | null {
    if (!next) return 'Оберіть файл.'
    if (next.size > COLLECTION_IMPORT_MAX_BYTES) {
      return `Файл має бути не більше ${COLLECTION_IMPORT_MAX_BYTES} байт.`
    }
    const name = next.name.toLowerCase()
    if (!name.endsWith('.json') && !name.endsWith('.csv')) {
      return 'Дозволені лише .json або .csv.'
    }
    return null
  }

  async function runImport(asPreview: boolean) {
    const validation = validateFile(file)
    if (validation) {
      setImportError(validation)
      return
    }
    if (!file || busy) return
    setBusy(true)
    setImportError(null)
    if (asPreview) {
      setPreview(null)
      setApplied(null)
    }
    try {
      const result = await collectionsApi.importFile(file, asPreview)
      if (asPreview) {
        setPreview(result)
      } else {
        setApplied(result)
        setPreview(null)
        onImported?.()
      }
    } catch (err) {
      setImportError(getApiErrorMessage(err, 'Не вдалося імпортувати.'))
    } finally {
      setBusy(false)
    }
  }

  function renderReport(result: CollectionImportResult) {
    return (
      <div className={styles.card}>
        <p className={styles.meta}>
          {result.preview ? 'Попередній перегляд' : 'Імпорт застосовано'} ·
          імпортовано {result.imported}, пропущено {result.skipped}, дублікатів{' '}
          {result.duplicates}
        </p>
        {result.unknownPerfumes.length > 0 ? (
          <p className={styles.meta}>
            Невідомі perfumeId: {result.unknownPerfumes.join(', ')}
          </p>
        ) : null}
        {result.errors.length > 0 ? (
          <ul className={styles.list}>
            {result.errors.map((item) => (
              <li key={item} className={styles.error}>
                {item}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    )
  }

  return (
    <section className={styles.card} aria-labelledby="collections-io-title">
      <h2 id="collections-io-title" className={styles.cardTitle}>
        Імпорт / експорт
      </h2>

      <div className={styles.actions}>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          loading={exporting}
          onClick={() => void handleExport('json')}
        >
          Експорт JSON
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          loading={exporting}
          onClick={() => void handleExport('csv')}
        >
          Експорт CSV
        </Button>
      </div>
      {exportError ? <p className={styles.error}>{exportError}</p> : null}
      {exportOk ? <p className={styles.success}>{exportOk}</p> : null}

      <div className={styles.form} style={{ marginBottom: 0 }}>
        <label>
          Файл імпорту (.json / .csv)
          <input
            type="file"
            accept=".json,.csv,text/csv,application/json"
            onChange={(e) => {
              setFile(e.target.files?.[0] ?? null)
              setPreview(null)
              setApplied(null)
              setImportError(null)
            }}
          />
        </label>
        {importError ? <p className={styles.error}>{importError}</p> : null}
        <div className={styles.actions}>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            loading={busy}
            onClick={() => void runImport(true)}
          >
            Попередній перегляд
          </Button>
          <Button
            type="button"
            size="sm"
            variant="accent"
            loading={busy}
            disabled={!preview}
            onClick={() => {
              if (
                window.confirm(
                  'Застосувати імпорт? Це змінить ваші колекції відповідно до файлу.',
                )
              ) {
                void runImport(false)
              }
            }}
          >
            Застосувати імпорт
          </Button>
        </div>
        <p className={styles.meta}>
          Попередній перегляд не змінює дані. Застосування виконується окремим
          запитом.
        </p>
      </div>

      {preview ? renderReport(preview) : null}
      {applied ? renderReport(applied) : null}
    </section>
  )
}
