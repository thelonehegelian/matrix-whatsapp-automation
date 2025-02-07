import { getRoomEvents, sendEvent } from "./matrixClientRequests";

export const getPseudoState = async (roomId: string, stateType: string) => {
  const eventsResponse = await getRoomEvents(roomId);
  const events = (await eventsResponse.json()) as any;

  const pseudoState = events.chunk.find((event) => event.type === stateType);
  return pseudoState;
};

export const setPseudoState = async (
  roomId: string,
  stateType: string,
  content: any
) => {
  return sendEvent(roomId, content, stateType);
};
