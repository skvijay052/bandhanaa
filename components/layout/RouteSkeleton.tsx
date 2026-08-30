export function RouteSkeleton({ variant = "cards" }: { variant?: "cards" | "messages" | "profile" | "list" }) {
  return <div className="flex h-dvh w-full overflow-hidden bg-white" aria-label="Loading page" aria-busy="true">
    <aside className="hidden w-[88px] shrink-0 border-r border-[#eff3f4] px-3 py-4 md:block xl:w-[245px] xl:px-4">
      <Skeleton className="h-12 w-12 xl:w-36" />
      <div className="mt-16 space-y-3">{Array.from({ length: 7 }, (_, index) => <Skeleton key={index} className="h-11 w-full rounded-xl" />)}</div>
    </aside>
    <main className="min-w-0 flex-1 overflow-hidden">
      <div className="border-b border-[#eff3f4] px-5 py-5 md:px-8"><Skeleton className="h-7 w-36" /><Skeleton className="mt-2 h-4 w-64 max-w-full" /></div>
      {variant === "messages" ? <MessageSkeleton /> : variant === "profile" ? <ProfileSkeleton /> : variant === "list" ? <ListSkeleton /> : <CardSkeleton />}
    </main>
  </div>;
}

function CardSkeleton() {
  return <div className="grid gap-5 p-5 sm:grid-cols-2 md:p-8 lg:grid-cols-3">{Array.from({ length: 6 }, (_, index) => <div key={index} className="overflow-hidden rounded-2xl border border-[#eff3f4]"><Skeleton className="aspect-square w-full rounded-none" /><div className="space-y-3 p-4"><Skeleton className="h-5 w-2/3" /><Skeleton className="h-4 w-1/2" /><Skeleton className="h-4 w-3/4" /></div></div>)}</div>;
}
function ListSkeleton() {
  return <div className="px-5 md:px-8">{Array.from({ length: 6 }, (_, index) => <div key={index} className="flex items-center gap-4 border-b border-[#eff3f4] py-5"><Skeleton className="size-20 shrink-0 rounded-full" /><div className="flex-1 space-y-3"><Skeleton className="h-5 w-40" /><Skeleton className="h-4 w-56 max-w-full" /></div><Skeleton className="h-10 w-28 rounded-full" /></div>)}</div>;
}
function MessageSkeleton() {
  return <div className="grid h-full md:grid-cols-[340px_1fr]"><div className="border-r border-[#eff3f4] p-4">{Array.from({ length: 7 }, (_, index) => <div key={index} className="mb-4 flex gap-3"><Skeleton className="size-14 rounded-full" /><div className="flex-1 space-y-2"><Skeleton className="h-4 w-2/3" /><Skeleton className="h-3 w-full" /></div></div>)}</div><div className="hidden p-8 md:block"><Skeleton className="ml-auto mt-20 h-10 w-48 rounded-full" /><Skeleton className="mt-16 h-10 w-40 rounded-full" /></div></div>;
}
function ProfileSkeleton() {
  return <div className="p-5 md:p-8"><div className="flex gap-5"><Skeleton className="size-28 rounded-full" /><div className="flex-1 space-y-3 pt-3"><Skeleton className="h-7 w-48" /><Skeleton className="h-4 w-64 max-w-full" /><Skeleton className="h-10 w-32 rounded-full" /></div></div><div className="mt-8 grid gap-5 md:grid-cols-2">{Array.from({ length: 4 }, (_, index) => <Skeleton key={index} className="h-40 w-full rounded-2xl" />)}</div></div>;
}
function Skeleton({ className }: { className: string }) {
  return <div className={`route-skeleton ${className}`} />;
}
