export type TypeFetch = {
  get(endpoint: string, options?: RequestInit | undefined): Promise<any>;
  post(endpoint: string, options?: RequestInit | undefined): Promise<any>;
  put(endpoint: string, options?: RequestInit | undefined): Promise<any>;
  patch(endpoint: string, options?: RequestInit | undefined): Promise<any>;
  delete(endpoint: string, options?: RequestInit | undefined): Promise<any>;
};

export class Fetch implements TypeFetch {
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
      .then(this.#resolution)
      .catch(this.#rejection);
  }

  #resolution(response: Response) {
    if (!response.ok) {
      throw new Error(response.statusText);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    } else {
      return response.text();
    }
  }

  #rejection(error: any) {
    throw error;
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
}
