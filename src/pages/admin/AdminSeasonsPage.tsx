import { useCallback } from 'react'
import type { Season } from '@/entities/perfume'
import { adminApi } from '@/features/admin/api/adminApi'
import { AdminDictionaryManager } from '@/features/admin/ui/AdminDictionaryManager'

export function AdminSeasonsPage() {
  const loadItems = useCallback((signal?: AbortSignal) => adminApi.listSeasons(signal), [])

  return (
    <AdminDictionaryManager<Season>
      title="Адмін · Сезони"
      description="CRUD сезонів через /api/admin/seasons."
      fields={[
        { key: 'name', label: 'Назва', required: true, maxLength: 50 },
        { key: 'description', label: 'Опис', kind: 'textarea' },
      ]}
      loadItems={loadItems}
      createItem={(payload) =>
        adminApi.createSeason({
          name: payload.name ?? '',
          description: payload.description,
        })
      }
      updateItem={(id, payload) =>
        adminApi.updateSeason(id, {
          name: payload.name ?? '',
          description: payload.description,
        })
      }
      deleteItem={(id) => adminApi.deleteSeason(id)}
      toForm={(item) => ({
        name: item.name,
        description: item.description ?? '',
      })}
      summarize={(item) => item.name}
    />
  )
}
