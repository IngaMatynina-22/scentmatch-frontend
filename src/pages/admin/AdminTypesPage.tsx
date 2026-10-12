import { useCallback } from 'react'
import type { FragranceType } from '@/entities/perfume'
import { adminApi } from '@/features/admin/api/adminApi'
import { AdminDictionaryManager } from '@/features/admin/ui/AdminDictionaryManager'

export function AdminTypesPage() {
  const loadItems = useCallback(
    (signal?: AbortSignal) => adminApi.listFragranceTypes(signal),
    [],
  )

  return (
    <AdminDictionaryManager<FragranceType>
      title="Адмін · Типи ароматів"
      description="CRUD типів через /api/admin/fragrance-types."
      fields={[
        { key: 'name', label: 'Назва', required: true, maxLength: 100 },
        { key: 'description', label: 'Опис', kind: 'textarea' },
      ]}
      loadItems={loadItems}
      createItem={(payload) =>
        adminApi.createFragranceType({
          name: payload.name ?? '',
          description: payload.description,
        })
      }
      updateItem={(id, payload) =>
        adminApi.updateFragranceType(id, {
          name: payload.name ?? '',
          description: payload.description,
        })
      }
      deleteItem={(id) => adminApi.deleteFragranceType(id)}
      toForm={(item) => ({
        name: item.name,
        description: item.description ?? '',
      })}
      summarize={(item) => item.name}
    />
  )
}
