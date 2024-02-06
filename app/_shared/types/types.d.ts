import type { SVGProps } from 'react';

export type SVGElementPropsType = SVGProps<SVGSVGElement>;

export type PageMeta = {
  current_page: number;
  total_page: number;
  per_page: number;
  total_record: number;
};

export type HTTPResponse = {
  code: int;
  data: any;
  message: string;
  meta: PageMeta;
  ok: boolean;
};
