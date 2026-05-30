// Intentionally LOUD. The whole point of this demo is to make it unmistakable
// when the second skeleton flashes after hydration. Red border + label +
// pulsing bars; if you see this twice on a single page load you've hit the
// useSyncExternalStore post-hydration re-suspend.
export function HydrationSkeleton() {
  return (
    <div className="rounded-lg border-4 border-red-500 bg-red-50 p-6 animate-pulse">
      <div className="text-xs font-bold uppercase tracking-widest text-red-700 mb-3">
        SKELETON
      </div>
      <div className="h-5 w-40 rounded bg-red-300 mb-2" />
      <div className="h-5 w-64 rounded bg-red-300 mb-2" />
      <div className="h-5 w-52 rounded bg-red-300" />
    </div>
  )
}
