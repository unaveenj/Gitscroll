export function RepoCardSkeleton() {
  return (
    <div
      className="relative w-full rounded-2xl overflow-hidden"
      style={{
        height: "clamp(460px, 58vh, 620px)",
        background: "#08111e",
        boxShadow: "0 0 0 1px rgba(255,255,255,0.06), 0 16px 48px rgba(0,0,0,0.6)",
      }}
    >
      <div className="gs-shimmer absolute inset-0 pointer-events-none" />

      <div className="flex flex-col h-full" style={{ padding: "18px 20px 16px" }}>
        {/* Badge */}
        <div className="h-5 w-24 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }} />

        {/* Title */}
        <div className="mt-3 space-y-2">
          <div className="h-6 w-3/4 rounded-lg" style={{ background: "rgba(255,255,255,0.07)" }} />
          <div className="h-6 w-1/2 rounded-lg" style={{ background: "rgba(255,255,255,0.05)" }} />
        </div>

        {/* Owner */}
        <div className="mt-2 flex items-center gap-2">
          <div className="h-3.5 w-3.5 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }} />
          <div className="h-2.5 w-24 rounded" style={{ background: "rgba(255,255,255,0.05)" }} />
        </div>

        {/* Description */}
        <div className="mt-3 space-y-1.5">
          <div className="h-3 w-full rounded" style={{ background: "rgba(255,255,255,0.05)" }} />
          <div className="h-3 w-4/5 rounded" style={{ background: "rgba(255,255,255,0.04)" }} />
        </div>

        {/* Chips + stars */}
        <div className="mt-3 flex items-center gap-1.5">
          <div className="h-6 w-20 rounded-md" style={{ background: "rgba(255,255,255,0.06)" }} />
          <div className="h-6 w-16 rounded-md" style={{ background: "rgba(255,255,255,0.04)" }} />
          <div className="ml-auto h-4 w-12 rounded" style={{ background: "rgba(255,255,255,0.05)" }} />
        </div>

        {/* Idea box */}
        <div
          className="mt-3 h-12 w-full rounded-lg"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
        />

        {/* Buttons */}
        <div className="mt-3 flex gap-2">
          <div className="h-9 w-20 rounded-xl" style={{ background: "rgba(255,255,255,0.05)" }} />
          <div className="h-9 flex-1 rounded-xl" style={{ background: "rgba(255,255,255,0.05)" }} />
        </div>
      </div>
    </div>
  );
}
