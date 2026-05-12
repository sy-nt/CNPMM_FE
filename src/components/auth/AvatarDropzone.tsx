import { ImagePlus, LoaderCircle } from 'lucide-react'
import { useRef } from 'react'
import type { ChangeEvent, DragEvent } from 'react'

type AvatarDropzoneProps = {
  fileName: string | null
  isUploading: boolean
  onFile: (file: File) => void
}

export function AvatarDropzone({
  fileName,
  isUploading,
  onFile,
}: AvatarDropzoneProps) {
  const inputRef = useRef<HTMLInputElement | null>(null)

  function handleFile(file: File | undefined) {
    if (!file || !file.type.startsWith('image/')) return
    onFile(file)
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    handleFile(event.target.files?.[0])
  }

  function handleDrop(event: DragEvent<HTMLButtonElement>) {
    event.preventDefault()
    handleFile(event.dataTransfer.files[0])
  }

  return (
    <div className="grid gap-2 text-sm font-semibold text-ink dark:text-paper">
      <span>Avatar image</span>
      <button
        className="group min-h-36 cursor-pointer rounded-3xl border border-dashed border-ink/20 bg-white/60 p-4 text-left transition-colors hover:border-copper hover:bg-white/80 dark:border-paper/20 dark:bg-paper/10 dark:hover:bg-paper/15"
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => event.preventDefault()}
        onDrop={handleDrop}
        type="button"
      >
        <input
          accept="image/*"
          className="hidden"
          onChange={handleChange}
          ref={inputRef}
          type="file"
        />
        <span className="flex h-full items-center gap-4">
          <span className="grid size-14 place-items-center rounded-2xl bg-cream text-ink transition-colors group-hover:bg-copper group-hover:text-paper dark:bg-copper dark:text-ink">
            {isUploading ? (
              <LoaderCircle aria-hidden="true" className="animate-spin" />
            ) : (
              <ImagePlus aria-hidden="true" />
            )}
          </span>
          <span>
            <span className="block text-base font-black">
              {fileName ?? 'Drop image here or browse'}
            </span>
            <span className="mt-1 block text-sm font-medium text-ink/60 dark:text-paper/60">
              Mock upload now; real avatar upload can use the same file hook
              later.
            </span>
          </span>
        </span>
      </button>
    </div>
  )
}
