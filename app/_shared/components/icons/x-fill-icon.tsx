import type { SVGElementPropsType } from '@/_shared/types/types';

export default function XFillIcon(props: SVGElementPropsType) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12" {...props}>
      <path
        fill="currentColor"
        d="m1.897 2.054l.073-.084a.75.75 0 0 1 .976-.073l.084.073L6 4.939l2.97-2.97a.75.75 0 1 1 1.06 1.061L7.061 6l2.97 2.97a.75.75 0 0 1 .072.976l-.073.084a.75.75 0 0 1-.976.073l-.084-.073L6 7.061l-2.97 2.97A.75.75 0 1 1 1.97 8.97L4.939 6l-2.97-2.97a.75.75 0 0 1-.072-.976l.073-.084l-.073.084Z"
      />
    </svg>
  );
}
