export declare namespace UserType {
  type Feature = 'event';

  type SendActivityResp = FetcherResponse & {
    code: number;
    message: string;
    data: any;
  };
}
