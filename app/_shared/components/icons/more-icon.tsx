import type { SVGElementPropsType } from '@/_shared/types/types';

export default function MoreIcon(props: SVGElementPropsType) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28" {...props}>
      <g fill="none">
        <path
          d="M8.751 14a2.75 2.75 0 1 1-5.5 0a2.75 2.75 0 0 1 5.5 0z"
          fill="currentColor"
        />
        <path
          d="M16.751 14a2.75 2.75 0 1 1-5.5 0a2.75 2.75 0 0 1 5.5 0z"
          fill="currentColor"
        />
        <path
          d="M22.001 16.75a2.75 2.75 0 1 0 0-5.5a2.75 2.75 0 0 0 0 5.5z"
          fill="currentColor"
        />
      </g>
    </svg>
  );
}
