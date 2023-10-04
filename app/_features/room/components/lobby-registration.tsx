'use client';

import { useEffect } from 'react';
import { Button } from '@nextui-org/react';
import { useInput } from '@/_shared/hooks/use-input';
import { useToggle } from '@/_shared/hooks/use-toggle';

export default function LobbyRegistration() {
  const { value: displayName, bindValue: bindDisplayNameField } = useInput('');
  const { active: isComponentActive, setInActive: setInActiveComponent } =
    useToggle(true);

  const continueAsGuestHandler = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (displayName.trim().length === 0) {
      alert('You must fill out the display name field');
    }
  };

  const openSignInModal = () => {
    document.dispatchEvent(new CustomEvent('open:sign-in-modal'));
  };

  useEffect(() => {
    document.addEventListener(
      'open:lobby-entrance-component',
      setInActiveComponent
    );

    return () => {
      document.removeEventListener(
        'open:lobby-entrance-component',
        setInActiveComponent
      );
    };
  }, [setInActiveComponent]);

  return isComponentActive ? (
    <div className="flex flex-1 flex-col justify-center">
      <h2 className="text-center text-lg font-medium md:text-xl">
        How would like you to join to the room?
      </h2>
      <p className="mt-1 text-center text-sm text-zinc-400">
        Join to the room as a guest or with your account
      </p>
      <form
        className="mt-10"
        onSubmit={(event) => continueAsGuestHandler(event)}
      >
        <div>
          <label
            htmlFor="display-name-input"
            className="mb-3 inline-block text-sm font-medium"
          >
            Enter your display name
          </label>
          <input
            id="display-name-input"
            className="w-full rounded-md bg-zinc-950 px-4 py-2.5 text-sm text-zinc-200 outline-none ring-1 ring-zinc-700 focus-visible:ring-1 focus-visible:ring-zinc-400"
            type="text"
            placeholder="Your real name or nickname"
            {...bindDisplayNameField}
          />
          <p className="mt-3 text-xs text-zinc-400">
            Other participants can easily recognize you by your display name
          </p>
        </div>
        <div className="mt-6 text-center">
          <Button
            variant="flat"
            className="w-full rounded-md bg-zinc-200 px-4  py-2 text-sm text-zinc-900 hover:bg-zinc-100 active:bg-zinc-50"
            type="submit"
          >
            Continue as a guest
          </Button>
        </div>
      </form>
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-zinc-700"></span>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-zinc-900 px-2 text-zinc-400">Or</span>
        </div>
      </div>
      <div className="text-center">
        <Button
          variant="flat"
          className="w-full rounded-md  bg-zinc-800  px-4 py-2 text-sm hover:bg-zinc-700 active:bg-zinc-600"
          onClick={openSignInModal}
        >
          Continue with your account
        </Button>
      </div>
    </div>
  ) : null;
}
