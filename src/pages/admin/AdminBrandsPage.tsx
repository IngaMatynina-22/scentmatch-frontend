import { useCallback } from 'react'
import { adminApi } from '@/features/admin/api/adminApi'
import { AdminDictionaryManager } from '@/features/admin/ui/AdminDictionaryManager'
import type { Brand } from '@/entities/perfume'

export function AdminBrandsPage() {
  const loadItems = useCallback((signal?: AbortSignal) => adminApi.listBrands(signal), [])

  return (
    <AdminDictionaryManager<Brand>
      title="Адмін · Бренди"
      description="CRUD брендів через /api/admin/brands (список — GET /api/brands)."
      fields={[
        { key: 'name', label: 'Назва', required: true, maxLength: 200 },
        { key: 'description', label: 'Опис', kind: 'textarea' },
        { key: 'country', label: 'Країна', maxLength: 100 },
        { key: 'website', label: 'Сайт', maxLength: 500 },
        { key: 'logoUrl', label: 'Logo URL', maxLength: 500 },
      ]}
      loadItems={loadItems}
      createItem={(payload) =>
        adminApi.createBrand({
          name: payload.name ?? '',
          description: payload.description,
          country: payload.country,
          website: payload.website,
          logoUrl: payload.logoUrl,
        })
      }
      updateItem={(id, payload) =>
        adminApi.updateBrand(id, {
          name: payload.name ?? '',
          description: payload.description,
          country: payload.country,
          website: payload.website,
          logoUrl: payload.logoUrl,
        })
      }
      deleteItem={(id) => adminApi.deleteBrand(id)}
      toForm={(item) => ({
        name: item.name,
        description: item.description ?? '',
        country: item.country ?? '',
        website: item.website ?? '',
        logoUrl: item.logoUrl ?? '',
      })}
      summarize={(item) => item.name}
    />
  )
}
