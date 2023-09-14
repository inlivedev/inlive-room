import type { SVGElementPropsType } from '@/_shared/types/types';

export default function ExpandIcon(props: SVGElementPropsType) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
      <path
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m17 8l-5-5l-5 5m10 8l-5 5l-5-5"
      />
    </svg>
  );
}
