# EDD Frontend

## Development
Execute the following command to start the development server:
```bash
npm start
```

## Build
Execute the following command to build the project:
```bash
npm run build
```
The build will be located in the `build` folder.


## Settings
In `src/config.js` it is posible to set the following configurations:
- `urls.server`: The URL of the backend server.


### TODO
- In `src/js/importlog.js` function `discoverFromXesGz` should be setted the parameters to pass to the discovery function in the server. At the moment it is hardcoded to default values. in future versions it should be possible to set the parameters in the frontend using a modal window.