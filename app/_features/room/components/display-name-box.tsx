import { useCallback } from 'react';
import { Button } from '@nextui-org/react';
import { useClientContext } from '@/_features/room/contexts/client-context';

export default function DisplayNameBox() {
  const { clientName } = useClientContext();

  const openUpdateClientForm = useCallback(() => {
    document.dispatchEvent(new CustomEvent('open:set-display-name-modal'));
  }, []);

  return (
    <div>
      <label
        htmlFor="display-name-readonly"
        className="mb-3 inline-block text-sm font-medium"
      >
        Your display name
      </label>
      <div className="flex gap-3">
        <div className="flex-1">
          <input
            id="display-name-readonly"
            className="w-full rounded-md bg-zinc-950 px-4 py-2.5 text-sm text-zinc-200 outline-none ring-1 ring-zinc-700 focus-visible:ring-1 focus-visible:ring-zinc-400"
            type="text"
            placeholder="There is no display name"
            readOnly
            defaultValue={clientName}
          />
        </div>
        <div>
          <Button
            variant="flat"
            className="rounded-md bg-zinc-800 px-4 py-2 text-sm hover:bg-zinc-700 active:bg-zinc-600"
            onClick={openUpdateClientForm}
          >
            Change
          </Button>
        </div>
      </div>
      <p className="mt-3 text-xs text-zinc-400">
        Other participants can easily recognize you by your display name
      </p>
    </div>
  );
}
