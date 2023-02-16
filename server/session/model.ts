export type CreateSessionInput = {
  userName: string;
  sessionName: string;
};

export type JoinSessionInput = {
  userName: string;
  sessionId: number;
};
