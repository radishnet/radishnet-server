# Open MUX Server
The server is the central hub. It connects clients together, holds the world state and serves data to GUIs.

## Known Issues
- Some versions of Node raise an `ERR_UNKNOWN_FILE_EXTENSION` error when running `npm run dev`. Unfortunately I have not found a fix for this yet except just running `npm run start` instead and skipping nodemon.
