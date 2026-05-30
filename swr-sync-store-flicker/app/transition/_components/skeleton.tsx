export function Skeleton({ label }: { label: string }) {
  return (
    <div className="rounded border border-dashed border-amber-400 bg-amber-100 p-4 text-amber-900">
      <div className="text-xs uppercase tracking-wide font-bold mb-2">
        Suspense fallback ({label})
      </div>
      <div className="h-4 w-32 animate-pulse rounded bg-amber-300" />
      <div className="mt-2 h-4 w-48 animate-pulse rounded bg-amber-300" />
    </div>
  )
}

export function PendingBadge({ visible }: { visible: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold transition-opacity ${
        visible
          ? 'bg-blue-600 text-white opacity-100'
          : 'bg-gray-200 text-gray-500 opacity-30'
      }`}
    >
      <span
        className={`h-2 w-2 rounded-full ${
          visible ? 'animate-pulse bg-white' : 'bg-gray-400'
        }`}
      />
      {visible ? 'loading…' : 'idle'}
    </span>
  )
}
