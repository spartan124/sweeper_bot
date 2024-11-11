# WebSocket Events Documentation

## Overview

This document provides documentation for the WebSocket events used in the chat application. These events facilitate real-time communication between users.

## WebSocket Connection

To establish a connection to the WebSocket server, use the following code snippet:

```javascript
const socket = io('http://your-server-url/chats'); // Replace with your server URL
```

## Events

### 1. Sending Messages

- **Event Name**: `new_message`
- **Description**: Emitted when a user sends a new message to a recipient.
- **Payload**:

  ```json
  {
      "message": "The content of the message",
      "recipient": "recipient_user_id"
  }
  ```

- **Example**:

  ```javascript
  function sendMessage(message, recipient) {
      socket.emit('new_message', {
          message: message,
          recipient: recipient
      });
  }
  ```

### 2. Typing Notifications

- **Event Name**: `is_typing`
- **Description**: Emitted to notify other users that the current user is typing.
- **Payload**:

  ```json
  {
      "room": "chat_room_id",
      "user_id": "current_user_id"
  }
  ```

- **Example**:

  ```javascript
  function notifyTyping(room) {
      socket.emit('is_typing', {
          room: room,
          user_id: currentUserId
      });
  }
  ```

### 3. Listening for New Messages

- **Event Name**: `new_message`
- **Description**: Emitted by the server when a new message is received.
- **Payload**:

  ```json
  {
      "message": "The content of the message",
      "sender": "sender_user_id"
  }
  ```

- **Example**:

  ```javascript
  socket.on('new_message', function(data) {
      console.log('New message received:', data);
      // Update the chat UI with the new message
  });
  ```

### 4. Listening for Typing Notifications

- **Event Name**: `is_typing`
- **Description**: Emitted by the server to indicate that a user is typing.
- **Payload**:

  ```json
  {
      "user_id": "typing_user_id"
  }
  ```

- **Example**:

  ```javascript
  socket.on('is_typing', function(data) {
      console.log('User is typing:', data.user_id);
      // Update the UI to show typing status
  });
  ```

### 5. User Online Status

- **Event Name**: `new_chat`
- **Description**: Emitted when a new chat is created, indicating that a user is online.
- **Payload**:

  ```json
  {
      "chat_id": "new_chat_id",
      "recipient": "recipient_user_id"
  }
  ```

- **Example**:

  ```javascript
  socket.on('new_chat', function(data) {
      console.log('New chat created:', data);
      // Update the chat list or UI accordingly
  });
  ```

### 6. User Offline Status

- **Event Name**: `deleted_message`
- **Description**: Emitted when a message is deleted.
- **Payload**:

  ```json
  {
      "message_id": "deleted_message_id"
  }
  ```

- **Example**:

  ```javascript
  socket.on('deleted_message', function(data) {
      console.log('Message deleted:', data.message_id);
  });
  ```

## Error Handling

Ensure to handle any potential errors that may arise during the SocketIO communication. You can listen for connection errors and handle them appropriately:

```javascript
socket.on('connect_error', (error) => {
    console.error('Connection Error:', error);
});
```

## Conclusion

This documentation provides a comprehensive overview of the WebSocket events used in the chat application. By following the examples and guidelines provided, frontend developers can effectively implement real-time communication features.
