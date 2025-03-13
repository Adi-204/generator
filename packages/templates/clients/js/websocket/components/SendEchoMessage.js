import { Text } from '@asyncapi/generator-react-sdk';

export function SendEchoMessage () {
  return (
  <Text>
    <Text>
        {
          `  // Method to send an echo message to the server
  sendEchoMessage(message) {
    this.websocket.send(JSON.stringify(message));
    console.log('Sent message to echo server:', message);
  }`
        }
    </Text>
  </Text>
  );
}
