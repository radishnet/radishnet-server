# Open MUX Server
The server is the central hub of Open MUX. It connects clients together, holds the world state and serves data to GUIs.

## Installing the server
- Using your Command Prompt or terminal, go into your projects folder
- Clone the server repo `git clone https://github.com/open-mux/open-mux-server.git`
- Go into the newly created folder
- Install the required node modules `npm install`

## Starting the server
- Run `npm run start` from the server folder

## Known Issues
- Some versions of Node raise an `ERR_UNKNOWN_FILE_EXTENSION` error when running `npm run dev`. Unfortunately I have not found a fix for this yet except just running `npm run start` instead and skipping nodemon.
