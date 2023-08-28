export const Fetcher = (baseURL: string) => {
  const resolution = async (response: Response) => {
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return response
        .json()
        .then((json) => ({
          ok: response.ok,
          ...json,
        }))
        .catch((error) => {
          throw error;
        });
    } else {
      return response.text();
    }
  };

  const rejection = (error: any) => {
    throw error;
  };

  const fetcher = (endpoint: string, options: RequestInit = {}) => {
    const fetchOptions = typeof options === 'object' ? options : {};
    const headersOptions =
      typeof fetchOptions.headers === 'object' ? fetchOptions.headers : {};

    return fetch(`${baseURL}${endpoint}`, {
      headers: {
        'Content-type': 'application/json; charset=utf-8',
        ...headersOptions,
      },
      ...fetchOptions,
    })
      .then(resolution)
      .catch(rejection);
  };

  return {
    get(endpoint: string, options: RequestInit | undefined = {}) {
      return fetcher(endpoint, {
        ...options,
        method: 'get',
      });
    },
    post(endpoint: string, options: RequestInit | undefined = {}) {
      return fetcher(endpoint, {
        ...options,
        method: 'post',
      });
    },
    put(endpoint: string, options: RequestInit | undefined = {}) {
      return fetcher(endpoint, {
        ...options,
        method: 'put',
      });
    },
    patch(endpoint: string, options: RequestInit | undefined = {}) {
      return fetcher(endpoint, {
        ...options,
        method: 'patch',
      });
    },
    delete(endpoint: string, options: RequestInit | undefined = {}) {
      return fetcher(endpoint, {
        ...options,
        method: 'delete',
      });
    },
  };
};
