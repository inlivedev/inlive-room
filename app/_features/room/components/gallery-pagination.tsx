import {
  Pagination,
  PaginationItemType,
  PaginationItemRenderProps,
  cn,
} from '@nextui-org/react';

import type { SVGElementPropsType } from '@/_shared/types/types';
import { isMobile } from './conference';

const ChevronIcon = (props: SVGElementPropsType) => (
  <svg
    aria-hidden="true"
    fill="none"
    focusable="false"
    height="1em"
    role="presentation"
    viewBox="0 0 24 24"
    width="1em"
    {...props}
  >
    <path
      d="M15.5 19l-7-7 7-7"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
    />
  </svg>
);

export default function GalleryPagination({
  totalItems,
  streamPerPage,
  page,
  onChange,
}: {
  totalItems: number;
  streamPerPage: number;
  page: number;
  onChange: (page: number) => void;
}) {
  const renderItem = ({
    ref,
    key,
    value,
    isActive,
    onNext,
    onPrevious,
    setPage,
    className,
  }: PaginationItemRenderProps) => {
    if (value === PaginationItemType.NEXT) {
      return (
        <button
          key={key}
          className={cn(
            className,
            'h-auto min-h-0 min-w-0 gap-3 rounded-xl bg-zinc-700/70 px-2 py-2  font-medium tabular-nums antialiased hover:bg-zinc-600 active:bg-zinc-500'
          )}
          onClick={onNext}
        >
          <ChevronIcon className="rotate-180" />
        </button>
      );
    }

    if (value === PaginationItemType.PREV) {
      return (
        <button
          key={key}
          className={cn(
            className,
            'h-auto min-h-0 min-w-0 gap-3 rounded-xl bg-zinc-700/70 px-2 py-2 font-medium tabular-nums antialiased hover:bg-zinc-600 active:bg-zinc-500'
          )}
          onClick={onPrevious}
        >
          <ChevronIcon />
        </button>
      );
    }

    if (isMobile()) {
      return;
    }

    if (value === PaginationItemType.DOTS) {
      return (
        <button key={key} className={className}>
          ...
        </button>
      );
    }

    // cursor is the default item
    return (
      <button
        key={key}
        ref={ref}
        className={cn(
          className,
          isActive
            ? ' h-auto min-h-0 min-w-0 gap-3 rounded-xl bg-red-900 p-2 font-medium tabular-nums text-stone-50 antialiased hover:bg-zinc-600 active:bg-red-900'
            : ' h-auto min-h-0 min-w-0 gap-3 rounded-xl bg-zinc-700/70 p-2 font-medium tabular-nums antialiased hover:bg-zinc-600 active:bg-zinc-500'
        )}
        onClick={() => setPage(value)}
      >
        {value}
      </button>
    );
  };

  return (
    <Pagination
      disableCursorAnimation
      showControls
      total={Math.ceil(totalItems / streamPerPage)}
      initialPage={1}
      className="gap-2"
      radius="full"
      renderItem={renderItem}
      variant="light"
      onChange={onChange}
      page={page}
    />
  );
}
