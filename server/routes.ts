import { Express } from 'express';
import { Server } from 'http';
import { WebSocketServer } from 'ws';
import { createActivityRepository } from './activity/repository';
import { createActivityService } from './activity/service';

import { NotFoundError, ValidationError } from './core/errors';
import { createSessionRepository } from './session/repository';
import { createSessionService, SessionService } from './session/service';
import { createUserRepository } from './user/repository';
import { createUserService } from './user/service';
import { createSessionWebsocket } from './session/websocket';

export const setupRoutes = ({
  expressApp,
  httpServer,
  websocketServer,
}: {
  expressApp: Express;
  httpServer: Server;
  websocketServer: WebSocketServer;
}) => {
  const activityRepository = createActivityRepository();
  const activityService = createActivityService({ activityRepository });

  const userRepository = createUserRepository();
  const userService = createUserService({ userRepository });

  const sessionWebsocket = createSessionWebsocket({ websocketServer });
  const sessionRepository = createSessionRepository();
  const sessionService = createSessionService({
    activityService,
    userService,
    sessionWebsocket,
    sessionRepository,
  });

  httpServer.on('upgrade', (req, socket, head) => {
    try {
      websocketServer.handleUpgrade(req, socket, head, (ws) => {
        websocketServer.emit('connection', ws);
      });
    } catch (err) {
      console.error(err);

      socket.destroy();
    }
  });

  expressApp.post('/session', async (req, res) => {
    const { sessionName, userName } = req.body;

    if (!sessionName && typeof sessionName !== 'string') {
      throw new ValidationError('Session name is required');
    }

    if (!userName && typeof userName !== 'string') {
      throw new ValidationError('User name is required');
    }

    const result = await sessionService.createSession({
      sessionName,
      userName,
    });

    res.status(200).json(result);
  });

  expressApp.get('/session/:sessionId', async (req, res) => {
    const sessionId = Number(req.params.sessionId);

    if (!sessionId || Number.isNaN(sessionId)) {
      throw new NotFoundError('Session not found');
    }

    const result = await sessionService.findSession(sessionId);

    res.status(200).json(result);
  });

  expressApp.get('/session/:sessionId/users', async (req, res) => {
    const sessionId = Number(req.params.sessionId);

    if (!sessionId || Number.isNaN(sessionId)) {
      throw new NotFoundError('Session not found');
    }

    const users = await sessionService.findSessionUsers(sessionId);

    res.status(200).json(users);
  });

  expressApp.get('/session/:sessionId/activities', async (req, res) => {
    const sessionId = Number(req.params.sessionId);

    if (!sessionId || Number.isNaN(sessionId)) {
      throw new NotFoundError('Session not found');
    }

    const activities = await activityService.findActivitiesBySession(sessionId);

    res.status(200).json(activities);
  });

  expressApp.post('/session/:sessionId/user/:userId/start', async (req, res) => {
    const sessionId = Number(req.params.sessionId);
    const userId = Number(req.params.userId);

    if (!sessionId || Number.isNaN(sessionId)) {
      throw new NotFoundError('Session not found');
    }

    if (!userId || Number.isNaN(userId)) {
      throw new NotFoundError('User not found');
    }

    const session = await sessionService.startSession({ userId, sessionId });

    res.status(200).json(session);
  });

  expressApp.post('/session/:sessionId/join', async (req, res) => {
    const sessionId = Number(req.params.sessionId);

    if (!sessionId || Number.isNaN(sessionId)) {
      throw new NotFoundError('Session not found');
    }

    const { userName } = req.body;

    if (!userName || typeof userName !== 'string') {
      throw new ValidationError('User name is required');
    }

    const session = await sessionService.joinSession({
      sessionId,
      userName,
    });

    res.status(200).json(session);
  });

  expressApp.post('/session/:sessionId/user/:userId/stop', async (req, res) => {
    const sessionId = Number(req.params.sessionId);
    const userId = Number(req.params.userId);

    if (!sessionId || Number.isNaN(sessionId)) {
      throw new NotFoundError('Session not found');
    }

    if (!userId || Number.isNaN(userId)) {
      throw new NotFoundError('Session not found');
    }

    const result = await sessionService.stopSession({ userId, sessionId });

    res.status(200).json(result);
  });
};
