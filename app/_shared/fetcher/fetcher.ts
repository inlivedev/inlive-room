export type FetcherResponse = {
  code: number;
  ok: boolean;
  body?: { [key: string]: any };
};

export const createFetcher = () => {
  const Fetcher = class {
    _baseUrl;

    constructor(baseUrl: string) {
      this._baseUrl = baseUrl;
    }

    _resolution = async (response: Response) => {
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        return response
          .json()
          .then((json) => ({
            code: response.status || 500,
            ok: response.ok,
            body: json,
          } as FetcherResponse))
          .catch((error) => {
            throw error;
          });
      } else {
        return response.text();
      }
    };

    _rejection = (error: any) => {
      throw error;
    };

    _fetcher = (endpoint: string, options: RequestInit = {}) => {
      const fetchOptions = typeof options === "object" ? options : {};
      const headersOptions = typeof fetchOptions.headers === "object"
        ? fetchOptions.headers
        : {};

      return fetch(`${this._baseUrl}${endpoint}`, {
        headers: {
          "Content-type": "application/json; charset=utf-8",
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
        method: "get",
      });
    };

    post = (endpoint: string, options: RequestInit | undefined = {}) => {
      return this._fetcher(endpoint, {
        ...options,
        method: "post",
      });
    };

    put = (endpoint: string, options: RequestInit | undefined = {}) => {
      return this._fetcher(endpoint, {
        ...options,
        method: "put",
      });
    };

    patch = (endpoint: string, options: RequestInit | undefined = {}) => {
      return this._fetcher(endpoint, {
        ...options,
        method: "patch",
      });
    };

    delete = (endpoint: string, options: RequestInit | undefined = {}) => {
      return this._fetcher(endpoint, {
        ...options,
        method: "delete",
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
