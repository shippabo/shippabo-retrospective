export type CreateSessionInput = {
  userName: string;
  sessionName: string;
};

export type StartSessionInput = {
  userId: number;
  sessionId: number;
};

export type JoinSessionInput = {
  userName: string;
  sessionId: number;
};

export type StopSessionInput = {
  userId: number;
  sessionId: number;
};
