import { useCallback } from 'react'
import type { Note } from '@/entities/perfume'
import { adminApi } from '@/features/admin/api/adminApi'
import { AdminDictionaryManager } from '@/features/admin/ui/AdminDictionaryManager'

export function AdminNotesPage() {
  const loadItems = useCallback((signal?: AbortSignal) => adminApi.listNotes(signal), [])

  return (
    <AdminDictionaryManager<Note>
      title="Адмін · Ноти"
      description="CRUD нот через /api/admin/notes."
      fields={[
        { key: 'name', label: 'Назва', required: true, maxLength: 150 },
        { key: 'category', label: 'Категорія', maxLength: 100 },
        { key: 'description', label: 'Опис', kind: 'textarea' },
      ]}
      loadItems={loadItems}
      createItem={(payload) =>
        adminApi.createNote({
          name: payload.name ?? '',
          description: payload.description,
          category: payload.category,
        })
      }
      updateItem={(id, payload) =>
        adminApi.updateNote(id, {
          name: payload.name ?? '',
          description: payload.description,
          category: payload.category,
        })
      }
      deleteItem={(id) => adminApi.deleteNote(id)}
      toForm={(item) => ({
        name: item.name,
        category: item.category ?? '',
        description: item.description ?? '',
      })}
      summarize={(item) =>
        item.category ? `${item.name} · ${item.category}` : item.name
      }
    />
  )
}
