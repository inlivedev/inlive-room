import { Button } from '@nextui-org/react';
import { useToggle } from '@/_shared/hooks/use-toggle';

export default function ConferenceNotification({
  show,
  text,
}: {
  show: boolean;
  text: string;
}) {
  const { active, setInActive } = useToggle(show);

  return active ? (
    <div className="flex w-full flex-col gap-3 rounded-md bg-blue-900/25 px-4 py-2 text-blue-300 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-6">
      <div className="flex-1">
        <p className="text-sm lg:text-center">{text}</p>
      </div>
      <div>
        <Button
          className="h-7 rounded bg-transparent px-3 text-xs font-medium text-blue-300 ring-1 ring-blue-300"
          onClick={() => setInActive()}
        >
          Dismiss
        </Button>
      </div>
    </div>
  ) : null;
}
