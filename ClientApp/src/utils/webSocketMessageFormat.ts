export const parseMessage = (message: string) => {
  try {
    return message.split("#");
  } catch (error) {
    console.error("Failed to parse message:", message);
    return null;
  }
};

export const encodeMessage = (message: string[]) => {
  return `CLIENT_MESSAGE#${message.join("#")}`;
};
