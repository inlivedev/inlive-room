import { Button } from '@nextui-org/react';
import React, { ChangeEvent } from 'react';

type FormWithIconProps = {
  title?: string;
  icon?: JSX.Element;
  value?: string;
  isReadOnly?: boolean;
  onClickForm?: () => void;
  onClickIcon?: () => void;
  ariaLabel?: string;
  bindInput?: {
    value: string;
    onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  };
};

export function FormWithIcon({
  title,
  icon,
  value,
  isReadOnly = false,
  onClickForm,
  onClickIcon,
  ariaLabel = '',
  bindInput,
}: FormWithIconProps) {
  return (
    <>
      <div className="flex flex-col gap-1">
        <div>
          <p className="text-sm">{title}</p>
        </div>
        <div>
          <form
            className="relative w-full"
            onClick={(event) => {
              event.preventDefault();
              onClickForm && onClickForm();
            }}
          >
            <input
              type="text"
              className="w-full rounded-md bg-zinc-950 p-2.5 pr-11 text-sm text-zinc-200 outline-none ring-1 ring-zinc-700 placeholder:text-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-400"
              value={value}
              readOnly={isReadOnly}
              onClick={(event) => {
                event.preventDefault();
                onClickForm && onClickForm();
              }}
              {...bindInput}
            />
            <Button
              type="submit"
              isIconOnly
              variant="flat"
              aria-label={ariaLabel}
              className="absolute right-3 top-1/2 h-6 w-6 min-w-0 -translate-y-1/2 rounded-full bg-transparent text-zinc-400"
              onClick={(event) => {
                event.preventDefault();
                onClickIcon && onClickIcon();
              }}
            >
              {icon}
            </Button>
          </form>
        </div>
      </div>
    </>
  );
}
