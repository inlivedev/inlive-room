export type FetcherResponse = {
  code: number;
  ok: boolean;
  body?: { [key: string]: any };
};

const createFetcher = () => {
  const Fetcher = class {
    _baseUrl;

    constructor(baseUrl: string) {
      this._baseUrl = baseUrl;
    }

    _resolution = async (response: Response) => {
      if (!response) {
        return {
          code: 500,
          ok: false,
          data: {},
        };
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return response
          .json()
          .then((json: { [key: string]: any }) => ({
            code: json.code || response.status,
            ok: response.ok,
            data: json.data || {},
            ...json,
          }))
          .catch((error: Error) => {
            throw error;
          });
      }

      return {
        code: response.status || 500,
        ok: response.ok,
        data: {
          message: response.text(),
        },
      };
    };

    _rejection = (error: Error) => {
      throw error;
    };

    _fetcher = (endpoint: string, options: RequestInit = {}) => {
      const fetchOptions = typeof options === 'object' ? options : {};
      const headersOptions =
        typeof fetchOptions.headers === 'object' ? fetchOptions.headers : {};

      return globalThis
        .fetch(`${this._baseUrl}${endpoint}`, {
          headers: {
            'Content-type': 'application/json; charset=utf-8',
            ...headersOptions,
          },
          ...fetchOptions,
        })
        .then(this._resolution)
        .catch(this._rejection);
    };

    get = (endpoint: string, options: RequestInit | undefined = {}) => {
      return this._fetcher(endpoint, {
        ...options,
        method: 'get',
      });
    };

    post = (endpoint: string, options: RequestInit | undefined = {}) => {
      return this._fetcher(endpoint, {
        ...options,
        method: 'post',
      });
    };

    put = (endpoint: string, options: RequestInit | undefined = {}) => {
      return this._fetcher(endpoint, {
        ...options,
        method: 'put',
      });
    };

    patch = (endpoint: string, options: RequestInit | undefined = {}) => {
      return this._fetcher(endpoint, {
        ...options,
        method: 'patch',
      });
    };

    delete = (endpoint: string, options: RequestInit | undefined = {}) => {
      return this._fetcher(endpoint, {
        ...options,
        method: 'delete',
      });
    };
  };

  return {
    createInstance: (baseUrl: string) => {
      const fetcher = new Fetcher(baseUrl);

      return {
        get: fetcher.get,
        post: fetcher.post,
        put: fetcher.put,
        patch: fetcher.patch,
        delete: fetcher.delete,
      };
    },
  };
};

const appOrigin = process.env.NEXT_PUBLIC_APP_ORIGIN || '';
const inliveHubOrigin = process.env.NEXT_PUBLIC_INLIVE_HUB_ORIGIN || '';
const inliveHubVersion = process.env.NEXT_PUBLIC_INLIVE_HUB_VERSION || '';
const inliveApiOrigin = process.env.NEXT_PUBLIC_INLIVE_API_ORIGIN || '';
const inliveApiVersion = process.env.NEXT_PUBLIC_INLIVE_API_VERSION || '';

const inliveHubBaseUrl = `${inliveHubOrigin}/${inliveHubVersion}`;
const inliveApiBaseUrl = `${inliveApiOrigin}/${inliveApiVersion}`;

export const InternalApiFetcher = createFetcher().createInstance(appOrigin);
export const InliveHubFetcher =
  createFetcher().createInstance(inliveHubBaseUrl);
export const InliveApiFetcher =
  createFetcher().createInstance(inliveApiBaseUrl);
