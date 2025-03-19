class WebSocketMessageUtils {
  static parseMessage(rawMessage) {
    try {
      return rawMessage.toString().split("#");
    } catch (error) {
      console.error("Error parsing message", error, rawMessage);
      return null;
    }
  }

  static encodeMessage(message) {
    return message.join("#");
  }
}

module.exports = WebSocketMessageUtils;
