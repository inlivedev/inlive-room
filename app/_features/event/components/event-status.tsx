export function StatusPublished() {
  return (
    <div className="inline-flex items-center rounded-sm bg-emerald-950 px-2 py-0.5 text-xs font-medium tracking-[0.275px] text-emerald-300 outline outline-emerald-800">
      Published
    </div>
  );
}
export function StatusDraft() {
  return (
    <div className="inline-flex items-center rounded-sm bg-blue-950 px-2 py-0.5 text-xs font-medium tracking-[0.275px] text-blue-300 outline outline-blue-800">
      Draft
    </div>
  );
}
export function StatusCanceled() {
  return (
    <div className="inline-flex items-center rounded-sm bg-red-950 px-2 py-0.5 text-xs font-medium tracking-[0.275px] text-red-300 outline outline-red-800">
      Canceled
    </div>
  );
}
