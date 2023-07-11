export type TypeFetch = {
  get(endpoint: string, options?: RequestInit | undefined): Promise<any>;
  post(endpoint: string, options?: RequestInit | undefined): Promise<any>;
  put(endpoint: string, options?: RequestInit | undefined): Promise<any>;
  patch(endpoint: string, options?: RequestInit | undefined): Promise<any>;
  delete(endpoint: string, options?: RequestInit | undefined): Promise<any>;
};

function factoryFetch() {
  return class Fetch implements TypeFetch {
    #baseURL;

    constructor(baseURL: string) {
      this.#baseURL = baseURL;
    }

    #fetch(endpoint: string, options: RequestInit = {}) {
      const fetchOptions = typeof options === 'object' ? options : {};
      const headersOptions =
        typeof fetchOptions.headers === 'object' ? fetchOptions.headers : {};

      return fetch(`${this.#baseURL}${endpoint}`, {
        headers: {
          'Content-type': 'application/json; charset=utf-8',
          ...headersOptions,
        },
        ...fetchOptions,
      })
        .then(async (response) => {
          const contentType = response.headers.get('content-type');
          const data = await (contentType &&
          contentType.includes('application/json')
            ? response.json()
            : response.text());
          return data;
        })
        .catch((error) => {
          throw error;
        });
    }

    get(endpoint: string, options: RequestInit | undefined = {}) {
      return this.#fetch(endpoint, {
        ...options,
        method: 'get',
      });
    }

    post(endpoint: string, options: RequestInit | undefined = {}) {
      return this.#fetch(endpoint, {
        ...options,
        method: 'post',
      });
    }

    put(endpoint: string, options: RequestInit | undefined = {}) {
      return this.#fetch(endpoint, {
        ...options,
        method: 'put',
      });
    }

    patch(endpoint: string, options: RequestInit | undefined = {}) {
      return this.#fetch(endpoint, {
        ...options,
        method: 'patch',
      });
    }

    delete(endpoint: string, options: RequestInit | undefined = {}) {
      return this.#fetch(endpoint, {
        ...options,
        method: 'delete',
      });
    }
  };
}

export const Fetch = factoryFetch();
