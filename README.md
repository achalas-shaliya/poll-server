# Poll Server

## Overview
Poll Server is a backend application that manages real-time polling using WebSocket technology. It allows users to join polls and automatically closes expired polls.

## Features
- Real-time communication using Socket.IO
- Ability to join specific polls
- Automatic management of expired polls

## Installation

2. Navigate to the project directory:
   ```
   cd poll-server
   ```
3. Install the dependencies:
   ```
   npm install
   ```

## Usage
1. Start the server:
   ```
   npm run dev
   ```
2. Connect to the WebSocket server from your client application.

## API
- **WebSocket Events**
  - `join_poll`: Allows a user to join a specific poll by providing the poll ID.

## Contributing
Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

## License
This project is licensed under the MIT License.