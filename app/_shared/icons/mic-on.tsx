import type { SVGElementPropsType } from '@/_shared/types/types.d.ts';

export default function MicOn(props: SVGElementPropsType) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="currentcolor"
      viewBox="0 0 256 256"
      {...props}
    >
      <path d="M80,128V64a48,48,0,0,1,96,0v64a48,48,0,0,1-96,0Zm128,0a8,8,0,0,0-16,0,64,64,0,0,1-128,0,8,8,0,0,0-16,0,80.11,80.11,0,0,0,72,79.6V232a8,8,0,0,0,16,0V207.6A80.11,80.11,0,0,0,208,128Z"></path>
    </svg>
  );
}
