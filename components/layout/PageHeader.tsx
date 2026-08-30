import type { ReactNode } from "react";

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return <header className="ui-page-header flex items-center justify-between"><div><h1 className="text-[20px] font-bold leading-6 tracking-[-.01em]">{title}</h1>{description ? <p className="mt-0.5 text-[14px] text-[var(--text-secondary)]">{description}</p> : null}</div>{actions ? <div className="ml-4">{actions}</div> : null}</header>;
}
