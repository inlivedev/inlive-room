export const getAudioStream = (
  constraints: MediaStreamConstraints,
  retries = 2
) => {
  return navigator.mediaDevices
    .getUserMedia(constraints)
    .catch(async (error): Promise<MediaStream> => {
      if (retries === 0) {
        throw error;
      }

      if (error instanceof OverconstrainedError) {
        return getAudioStream({ audio: true }, retries--);
      }

      throw error;
    });
};

export const getVideoStream = (
  constraints: MediaStreamConstraints,
  retries = 2
) => {
  return navigator.mediaDevices
    .getUserMedia(constraints)
    .catch(async (error): Promise<MediaStream> => {
      if (retries === 0) {
        throw error;
      }

      if (error instanceof OverconstrainedError) {
        return getVideoStream({ video: true }, retries--);
      }

      throw error;
    });
};

export const defaultVideoConstraints: MediaTrackConstraints = {
  width: { ideal: 1280 },
  height: { ideal: 720 },
  advanced: [
    {
      frameRate: { min: 30 },
    },
    { height: { min: 360 } },
    { width: { min: 720 } },
    { frameRate: { max: 30 } },
    { width: { max: 1280 } },
    { height: { max: 720 } },
    { aspectRatio: { exact: 1.77778 } },
  ],
};

export const videoConstraints = () => {
  if (typeof window === 'undefined') return false;

  const selectedVideoInputId = window.sessionStorage.getItem(
    'device:selected-video-input-id'
  );

  if (selectedVideoInputId) {
    defaultVideoConstraints['deviceId'] = { exact: selectedVideoInputId };
  }

  return defaultVideoConstraints;
};

export const audioConstraints = () => {
  if (typeof window === 'undefined') return false;

  const selectedAudioInputId = window.sessionStorage.getItem(
    'device:selected-audio-input-id'
  );

  const defaultConstraints = {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
  };

  if (selectedAudioInputId) {
    return {
      deviceId: { exact: selectedAudioInputId },
      ...defaultConstraints,
    };
  }

  return defaultConstraints;
};

export const getUserMedia = async (constraints: MediaStreamConstraints) => {
  try {
    const {
      audio: audioConstraints,
      video: videoConstraints,
      ...otherConstraints
    } = constraints;
    const mediaStream = new MediaStream();

    const audioStreamPromise = new Promise<MediaStream | null>((resolve) => {
      if (typeof audioConstraints === 'undefined') return resolve(null);

      return resolve(
        getAudioStream({
          audio: audioConstraints,
          ...otherConstraints,
        })
      );
    });

    const videoStreamPromise = new Promise<MediaStream | null>((resolve) => {
      if (typeof videoConstraints === 'undefined') return resolve(null);

      return resolve(
        getVideoStream({
          video: videoConstraints,
          ...otherConstraints,
        })
      );
    });

    const [audioStream, videoStream] = await Promise.all([
      audioStreamPromise,
      videoStreamPromise,
    ]);

    if (audioStream) {
      audioStream.getAudioTracks().forEach((track) => {
        mediaStream.addTrack(track);
      });
    }

    if (videoStream) {
      videoStream.getVideoTracks().forEach((track) => {
        mediaStream.addTrack(track);
      });
    }

    return mediaStream;
  } catch (error) {
    if (error instanceof Error) {
      if (
        error.name === 'NotAllowedError' ||
        error.name === 'PermissionDeniedError'
      ) {
        const permissionError = new Error(
          'Please allow this website to use your camera and microphone before continue'
        );
        permissionError.name = error.name;

        throw permissionError;
      }
    }

    throw error;
  }
};
