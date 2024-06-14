import type { SVGElementPropsType } from '@/_shared/types/types';

export default function TablerCircleArrowDownIcon(props: SVGElementPropsType) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0" />
      <path d="M8 12l4 4" />
      <path d="M12 8v8" />
      <path d="M16 12l-4 4" />
    </svg>
  );
}
