import { Text } from '@asyncapi/generator-react-sdk';

export function RegisterErrorHandler  () {
  return (
  <Text>
    <Text>
        {
          `  // Method to register custom error handlers
  registerErrorHandler(handler) {
    if (typeof handler === 'function') {
      this.errorHandlers.push(handler);
    } else {
      console.warn('Error handler must be a function');
    }
  }`
        }
    </Text>
  </Text>
  );
}
