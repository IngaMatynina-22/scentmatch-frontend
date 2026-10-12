import {
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
  type SelectHTMLAttributes,
} from 'react'
import styles from './Field.module.css'

const MENU_GAP = 6
const MENU_MAX_CAP = 256
const VIEWPORT_PADDING = 8

export type SelectOption = {
  value: string
  label: string
  disabled?: boolean
}

export type SelectProps = Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  'children' | 'onChange'
> & {
  label: string
  options: SelectOption[]
  hint?: ReactNode
  error?: string
  placeholder?: string
  onChange?: (event: ChangeEvent<HTMLSelectElement>) => void
}

export function Select({
  label,
  options,
  hint,
  error,
  placeholder,
  id,
  className,
  value,
  defaultValue,
  disabled,
  name,
  onChange,
  ...rest
}: SelectProps) {
  const generatedId = useId()
  const selectId = id ?? generatedId
  const listboxId = `${selectId}-listbox`
  const hintId = hint ? `${selectId}-hint` : undefined
  const errorId = error ? `${selectId}-error` : undefined

  const isControlled = value !== undefined
  const [internalValue, setInternalValue] = useState(String(defaultValue ?? ''))
  const currentValue = String(isControlled ? (value ?? '') : internalValue)

  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const [menuStyle, setMenuStyle] = useState<CSSProperties | undefined>()
  const rootRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const hiddenSelectRef = useRef<HTMLSelectElement>(null)

  function updateMenuPosition() {
    const trigger = triggerRef.current
    if (!trigger) return

    const rect = trigger.getBoundingClientRect()
    const spaceBelow = window.innerHeight - rect.bottom - VIEWPORT_PADDING - MENU_GAP
    const spaceAbove = rect.top - VIEWPORT_PADDING - MENU_GAP
    const openUpward = spaceBelow < 160 && spaceAbove > spaceBelow
    const available = Math.max(0, openUpward ? spaceAbove : spaceBelow)
    const maxHeight = Math.min(MENU_MAX_CAP, available)

    setMenuStyle(
      openUpward
        ? {
            top: 'auto',
            bottom: `calc(100% + ${MENU_GAP}px)`,
            maxHeight,
          }
        : {
            top: `calc(100% + ${MENU_GAP}px)`,
            bottom: 'auto',
            maxHeight,
          },
    )
  }

  const enabledOptions = useMemo(
    () => options.filter((option) => !option.disabled),
    [options],
  )

  const selectedOption = options.find((option) => option.value === currentValue)
  const displayLabel =
    selectedOption?.label ??
    (placeholder && currentValue === '' ? placeholder : currentValue || '—')

  useLayoutEffect(() => {
    if (!open) {
      setMenuStyle(undefined)
      return
    }

    updateMenuPosition()

    function onReposition() {
      updateMenuPosition()
    }

    window.addEventListener('resize', onReposition)
    window.addEventListener('scroll', onReposition, true)
    return () => {
      window.removeEventListener('resize', onReposition)
      window.removeEventListener('scroll', onReposition, true)
    }
  }, [open])

  useEffect(() => {
    if (!open) return

    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    function onKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const index = enabledOptions.findIndex((option) => option.value === currentValue)
    setActiveIndex(index >= 0 ? index : 0)
  }, [open, currentValue, enabledOptions])

  useEffect(() => {
    if (!open || activeIndex < 0) return
    const item = listRef.current?.querySelector<HTMLElement>(
      `[data-index="${activeIndex}"]`,
    )
    item?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex, open])

  function commitValue(next: string) {
    if (!isControlled) {
      setInternalValue(next)
    }

    const select = hiddenSelectRef.current
    if (onChange && select) {
      const prototype = Object.getPrototypeOf(select) as HTMLSelectElement
      const descriptor = Object.getOwnPropertyDescriptor(prototype, 'value')
      descriptor?.set?.call(select, next)
      const event = {
        target: select,
        currentTarget: select,
      } as ChangeEvent<HTMLSelectElement>
      onChange(event)
    }

    setOpen(false)
  }

  function onTriggerKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (disabled) return

    if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      if (!open) {
        setOpen(true)
        return
      }
    }

    if (!open) return

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex((index) => Math.max(0, index - 1))
    } else if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIndex((index) => Math.min(enabledOptions.length - 1, index + 1))
    } else if (event.key === 'Home') {
      event.preventDefault()
      setActiveIndex(0)
    } else if (event.key === 'End') {
      event.preventDefault()
      setActiveIndex(Math.max(0, enabledOptions.length - 1))
    } else if (event.key === 'Enter') {
      event.preventDefault()
      const option = enabledOptions[activeIndex]
      if (option) commitValue(option.value)
    }
  }

  return (
    <div className={styles.field} ref={rootRef}>
      <label className={styles.label} htmlFor={selectId}>
        {label}
      </label>

      <select
        ref={hiddenSelectRef}
        id={`${selectId}-native`}
        className={styles.visuallyHidden}
        tabIndex={-1}
        aria-hidden="true"
        name={name}
        value={currentValue}
        disabled={disabled}
        onChange={() => undefined}
        {...rest}
      >
        {placeholder ? <option value="">{placeholder}</option> : null}
        {options.map((option) => (
          <option key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
      </select>

      <div className={styles.selectShell}>
        <button
          ref={triggerRef}
          type="button"
          id={selectId}
          className={[
            styles.control,
            styles.selectTrigger,
            error ? styles.invalid : '',
            className ?? '',
          ]
            .filter(Boolean)
            .join(' ')}
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listboxId}
          aria-invalid={error ? true : undefined}
          aria-describedby={[hintId, errorId].filter(Boolean).join(' ') || undefined}
          onClick={() => {
            if (!disabled) setOpen((next) => !next)
          }}
          onKeyDown={onTriggerKeyDown}
        >
          <span className={styles.selectValue}>{displayLabel}</span>
        </button>

        {open ? (
          <ul
            ref={listRef}
            id={listboxId}
            className={styles.selectMenu}
            role="listbox"
            aria-labelledby={selectId}
            style={menuStyle}
          >
            {options.map((option) => {
              const enabledIndex = enabledOptions.findIndex(
                (item) => item.value === option.value,
              )
              const selected = option.value === currentValue
              const active = enabledIndex === activeIndex
              return (
                <li
                  key={option.value}
                  id={`${selectId}-option-${option.value || 'empty'}`}
                  role="option"
                  aria-selected={selected}
                  aria-disabled={option.disabled || undefined}
                  data-index={enabledIndex}
                  className={[
                    styles.selectOption,
                    selected ? styles.selectOptionSelected : '',
                    active ? styles.selectOptionActive : '',
                    option.disabled ? styles.selectOptionDisabled : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onMouseEnter={() => {
                    if (!option.disabled && enabledIndex >= 0) {
                      setActiveIndex(enabledIndex)
                    }
                  }}
                  onMouseDown={(event) => {
                    event.preventDefault()
                    if (!option.disabled) commitValue(option.value)
                  }}
                >
                  {option.label}
                </li>
              )
            })}
          </ul>
        ) : null}
      </div>

      {hint ? (
        <p id={hintId} className={styles.hint}>
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className={styles.error} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}
