# Matrix-WhatsApp Automation

This project aims to automate workflows between Matrix and potentially other services like WhatsApp, using the `matrix-js-sdk`.

## Features

*   Connects to a Matrix homeserver.
*   (Potentially more features to be added based on project development)

## Integrations

*   **Make.com / Integromat:** Contains logic for interacting with Make.com scenarios.
    *   Currently includes an integration with Trello (`src/integrations/make/trello.ts`).

## Technology Stack

*   Node.js
*   TypeScript
*   `matrix-js-sdk`

## Getting Started

1.  **Install dependencies:**
    ```bash
    npm install
    ```
2.  **Configure environment variables:** (You might need a `.env` file or similar for credentials like Matrix access tokens)
    *   `MATRIX_HOMESERVER_URL`
    *   `MATRIX_USER_ID`
    *   `MATRIX_ACCESS_TOKEN`
3.  **Run the application:**
    ```bash
    npm start # Or your specific run command, e.g., ts-node src/index.ts
    ```

## Development

(Add details about running in development mode, linting, testing, etc.)

## Contributing

(Add guidelines for contributing to the project.)
