export const webShare = async (url = '', title = '') => {
  return new Promise<boolean>(async (resolve) => {
    try {
      if (
        typeof window?.navigator?.canShare !== 'undefined' &&
        typeof window?.navigator?.share !== 'undefined' &&
        url.trim().length > 0
      ) {
        if (!navigator.canShare({ url, title })) {
          resolve(false);
        }

        await navigator.share({ url, title });
      } else {
        resolve(false);
      }
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          alert(
            'Please grant an access to use web sharing feature in your settings'
          );
        }
      }

      console.error(error);
      resolve(false);
    }
  });
};
