import { useState, useRef, useCallback } from 'react'
import { Upload, FileAudio, X } from 'lucide-react'

const ACCEPTED_TYPES = ['video/mp4', 'audio/mp4', 'audio/mpeg', 'audio/wav', 'audio/webm']

function UploadZone({ onUpload, disabled }) {
  const [dragOver, setDragOver] = useState(false)
  const [file, setFile] = useState(null)
  const [error, setError] = useState(null)
  const inputRef = useRef(null)

  const handleFile = useCallback((f) => {
    setError(null)

    if (!f) return

    // Allow common audio/video files
    const ext = f.name.split('.').pop().toLowerCase()
    const validExtensions = ['mp4', 'mp3', 'wav', 'webm', 'm4a']

    if (!ACCEPTED_TYPES.includes(f.type) && !validExtensions.includes(ext)) {
      setError('Please upload an MP4, MP3, WAV, or WebM file.')
      return
    }

    setFile(f)
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files[0]
    handleFile(f)
  }, [handleFile])

  const handleSubmit = useCallback(() => {
    if (!file || disabled) return
    onUpload(file)
  }, [file, disabled, onUpload])

  return (
    <div className="flex flex-col gap-4">
      <div
        className={`border-2 border-dashed rounded-card p-8 text-center transition-colors duration-fast cursor-pointer ${
          dragOver
            ? 'border-accent bg-accent-subtle'
            : file
              ? 'border-border bg-surface'
              : 'border-border hover:border-text-muted'
        }`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !file && inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".mp4,.mp3,.wav,.webm,.m4a"
          className="hidden"
          onChange={(e) => handleFile(e.target.files[0])}
        />

        {file ? (
          <div className="flex items-center justify-center gap-3">
            <FileAudio className="w-5 h-5 text-accent" />
            <span className="text-body text-text-primary">{file.name}</span>
            <button
              className="text-text-muted hover:text-text-secondary transition-colors duration-fast"
              onClick={(e) => { e.stopPropagation(); setFile(null) }}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <Upload className="w-6 h-6 text-text-muted" />
            <p className="text-body text-text-secondary">
              Drop your recording here or click to browse
            </p>
            <p className="text-small text-text-muted">MP4, MP3, WAV, or WebM</p>
          </div>
        )}
      </div>

      {error && (
        <p className="text-small text-destructive">{error}</p>
      )}

      {file && (
        <button
          className="self-end bg-accent text-background font-medium px-5 py-2 rounded-btn transition-colors duration-fast hover:bg-accent-hover disabled:opacity-40"
          onClick={handleSubmit}
          disabled={disabled}
        >
          Analyse Interview
        </button>
      )}
    </div>
  )
}

export default UploadZone
