import bodyParser from 'body-parser';
import cors from 'cors';
import express, { NextFunction, Request, Response } from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { ServerError } from './core/errors';
import { setupHeartbeat } from './heartbeat';

import { setupRoutes } from './routes';

const websocketServer = new WebSocketServer({
  noServer: true,
});

const expressApp = express();

const httpServer = createServer(expressApp);

const port = 5001;

expressApp.use(bodyParser.urlencoded({ extended: true }));
expressApp.use(bodyParser.json());
expressApp.use(cors());

setupHeartbeat(websocketServer);

setupRoutes({ expressApp, httpServer, websocketServer });

expressApp.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
  if (res.headersSent) {
    return next(err);
  }

  if (err instanceof ServerError) {
    res.status(err.status).json({ error: err.message });
  } else {
    console.error(err);

    res.status(500).json({ error: 'Internal Server Error' });
  }
});

httpServer.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
