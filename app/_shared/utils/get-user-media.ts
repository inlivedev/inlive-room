export const getUserMedia = async (constraints: MediaStreamConstraints) => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    return stream;
  } catch (error) {
    console.error(error);

    if (error instanceof Error) {
      if (
        error.name == 'NotAllowedError' ||
        error.name == 'PermissionDeniedError'
      ) {
        alert(
          'Please allow this website to use your camera and microphone before continue'
        );
      }
    }

    throw error;
  }
};
