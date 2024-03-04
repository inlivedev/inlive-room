import { SVGElementPropsType } from '@/_shared/types/types';

export default function PhotoDeleteIcon(props: SVGElementPropsType) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      strokeWidth="2"
      stroke="currentColor"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M15 8h.01" />
      <path d="M13 21h-7a3 3 0 0 1 -3 -3v-12a3 3 0 0 1 3 -3h12a3 3 0 0 1 3 3v7" />
      <path d="M3 16l5 -5c.928 -.893 2.072 -.893 3 0l3 3" />
      <path d="M14 14l1 -1c.928 -.893 2.072 -.893 3 0" />
      <path d="M22 22l-5 -5" />
      <path d="M17 22l5 -5" />
    </svg>
  );
}
