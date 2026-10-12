export { preferencesApi } from '@/features/preferences/api/preferencesApi'
export {
  createEmptyPreferencesForm,
  hasConfiguredPreferences,
  preferencesToForm,
  PREFERENCE_SCALE_FIELDS,
  PREFERENCE_SCALE_LEVELS,
  type PreferencesFormState,
  type PreferenceScaleKey,
  type UpdateUserPreferencesRequest,
  type UserPreferences,
} from '@/features/preferences/model/types'
export { validatePreferencesForm } from '@/features/preferences/model/validation'
