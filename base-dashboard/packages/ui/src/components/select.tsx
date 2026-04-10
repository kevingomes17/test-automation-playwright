import { Select as BaseSelect } from "@base-ui/react/select"

export type SelectOption = { value: string; label: string }

type Props = {
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  className?: string
}

export function Select({ value, onChange, options, className }: Props) {
  return (
    <BaseSelect.Root
      value={value}
      onValueChange={(v) => v && onChange(v as string)}
    >
      <BaseSelect.Trigger
        className={
          "border-input bg-background hover:bg-accent flex h-8 items-center justify-between gap-2 rounded-md border px-2.5 text-sm outline-none " +
          (className ?? "")
        }
      >
        <BaseSelect.Value />
        <BaseSelect.Icon>
          <svg
            width="10"
            height="10"
            viewBox="0 0 10 10"
            aria-hidden
            className="text-muted-foreground"
          >
            <path
              d="M2 4l3 3 3-3"
              stroke="currentColor"
              strokeWidth="1.5"
              fill="none"
            />
          </svg>
        </BaseSelect.Icon>
      </BaseSelect.Trigger>
      <BaseSelect.Portal>
        <BaseSelect.Positioner sideOffset={6} className="z-50">
          <BaseSelect.Popup className="bg-popover text-popover-foreground rounded-md border p-1 shadow-md outline-none">
            <BaseSelect.List>
              {options.map((opt) => (
                <BaseSelect.Item
                  key={opt.value}
                  value={opt.value}
                  className="data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground flex cursor-default items-center rounded-sm px-2 py-1 text-sm outline-none"
                >
                  <BaseSelect.ItemText>{opt.label}</BaseSelect.ItemText>
                </BaseSelect.Item>
              ))}
            </BaseSelect.List>
          </BaseSelect.Popup>
        </BaseSelect.Positioner>
      </BaseSelect.Portal>
    </BaseSelect.Root>
  )
}
