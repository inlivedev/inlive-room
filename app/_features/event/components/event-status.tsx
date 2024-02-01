import { Code } from '@nextui-org/react';

export function StatusPublished() {
  return (
    <Code className="rounded-sm bg-emerald-950 text-xs text-emerald-300 ring-1 ring-emerald-800">
      Published
    </Code>
  );
}
export function StatusDraft() {
  return (
    <Code className="rounded-sm bg-blue-950 text-xs text-blue-300 ring-1 ring-blue-800">
      Draft
    </Code>
  );
}
