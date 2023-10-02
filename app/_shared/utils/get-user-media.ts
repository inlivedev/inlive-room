const getAudioStream = (constraints: MediaStreamConstraints, retries = 3) => {
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

const getVideoStream = (constraints: MediaStreamConstraints, retries = 3) => {
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
        alert(
          'Please allow this website to use your camera and microphone before continue'
        );
      }
    }

    throw error;
  }
};
