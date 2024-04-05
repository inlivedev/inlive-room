export const errorNoClientID = new Error(
  'Client ID is required for event room'
);
export const errorEventNotFound = new Error('Event not found');
export const errorParticipantNotFound = new Error(
  'Participant not registered or found'
);

export const Error404 = [errorEventNotFound];

export const Error403 = [errorNoClientID, errorParticipantNotFound];
