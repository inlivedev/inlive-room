const enableWebinar = process.env.NEXT_PUBLIC_ENABLE_WEBINAR === 'true';

export const featureFlag = {
  enableWebinar: enableWebinar,
};
