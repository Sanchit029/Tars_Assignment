"use client";

export function ChatSkeleton() {
  return (
    <div className="flex flex-col h-full animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center gap-3 p-4 border-b">
        <div className="h-9 w-9 rounded-full bg-muted" />
        <div className="space-y-2">
          <div className="h-3 w-24 bg-muted rounded" />
          <div className="h-2 w-16 bg-muted rounded" />
        </div>
      </div>

      {/* Messages skeleton */}
      <div className="flex-1 p-4 space-y-4">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className={`flex ${i % 3 === 0 ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`flex gap-2 ${i % 3 === 0 ? "flex-row-reverse" : ""}`}
            >
              {i % 3 !== 0 && (
                <div className="h-7 w-7 rounded-full bg-muted flex-shrink-0" />
              )}
              <div className="space-y-1">
                <div
                  className="h-8 bg-muted rounded-2xl"
                  style={{ width: `${100 + (i * 40) % 200}px` }}
                />
                <div className="h-2 w-12 bg-muted rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Input skeleton */}
      <div className="p-3 border-t">
        <div className="flex gap-2">
          <div className="flex-1 h-10 bg-muted rounded-md" />
          <div className="h-10 w-10 bg-muted rounded-md" />
        </div>
      </div>
    </div>
  );
}

export function SidebarSkeleton() {
  return (
    <div className="animate-pulse">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3 border-b">
          <div className="h-11 w-11 rounded-full bg-muted" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-28 bg-muted rounded" />
            <div className="h-2 w-40 bg-muted rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
