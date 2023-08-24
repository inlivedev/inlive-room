import { registerClient } from '../api/api';

export const createClientFactory = (createClient: typeof registerClient) => {
  return (roomId = '') => {
    const client = {
      clientId: '',
      roomId: '',
    };

    return new Promise<typeof client>(async (resolve) => {
      const storage = JSON.parse(sessionStorage.getItem('client') || '{}');
      client.clientId = storage?.clientId || '';
      client.roomId = storage?.roomId || '';

      if (!client.clientId || !client.roomId || client.roomId !== roomId) {
        const data = await createClient(roomId).then(
          (response) => response.data
        );

        client.clientId = data.clientId;
        client.roomId = roomId;

        sessionStorage.setItem('client', JSON.stringify(client));
        resolve(client);
      } else {
        resolve(client);
      }
    });
  };
};

export const createClient = createClientFactory(registerClient);
