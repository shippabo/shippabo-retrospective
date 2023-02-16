import { Express } from 'express';

import { NotFoundError, ValidationError } from './core/errors';
import { createSessionRepository } from './session/repository';
import { createSessionService, SessionService } from './session/service';
import { createUserRepository } from './user/repository';
import { createUserService } from './user/service';

export const setupRoutes = (app: Express) => {
  const userRepository = createUserRepository();
  const userService = createUserService({ userRepository });

  const sessionRepository = createSessionRepository();
  const sessionService = createSessionService({ userService, sessionRepository });

  app.post('/session', async (req, res) => {
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

  app.get('/session/:id', async (req, res) => {
    const sessionId = Number(req.params.id);

    if (!sessionId || Number.isNaN(sessionId)) {
      throw new NotFoundError('Session not found');
    }

    const result = await sessionService.findSession(sessionId);

    res.status(200).json(result);
  });

  app.get('/session/:id/users', async (req, res) => {
    const sessionId = Number(req.params.id);

    if (!sessionId || Number.isNaN(sessionId)) {
      throw new NotFoundError('Session not found');
    }

    const users = await sessionService.findSessionUsers(sessionId);

    res.status(200).json(users);
  });

  app.post('/session/:id/start', async (req, res) => {
    const sessionId = Number(req.params.id);

    if (!sessionId || Number.isNaN(sessionId)) {
      throw new NotFoundError('Session not found');
    }

    const session = await sessionService.startSession(sessionId);

    res.status(200).json(session);
  });

  app.post('/session/:id/join', async (req, res) => {
    const sessionId = Number(req.params.id);

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

  app.post('/session/:id/stop', async (req, res) => {
    const sessionId = Number(req.params.id);

    if (!sessionId || Number.isNaN(sessionId)) {
      throw new NotFoundError('Session not found');
    }

    const result = await sessionService.stopSession(sessionId);

    res.status(200).json(result);
  });
};
