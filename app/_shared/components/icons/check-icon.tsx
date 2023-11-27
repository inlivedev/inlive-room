import type { SVGElementPropsType } from '@/_shared/types/types';

export default function CheckIcon(props: SVGElementPropsType) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
      <path
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="m5 12l5 5L20 7"
      />
    </svg>
  );
}
