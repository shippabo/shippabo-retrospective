type ErrorData = Record<string, unknown>;

export class ServerError<Data = ErrorData> extends Error {
  public status: number;

  public message: string;

  public data?: Data;

  constructor(message?: string, data?: Data) {
    super(message);

    this.name = 'ServerError';
    this.message = message ?? 'Server error';
    this.status = 500;
    this.data = data;
  }
}

export class NotFoundError<Data> extends ServerError<Data> {
  constructor(message?: string, data?: Data) {
    super(message ?? 'Not Found', data);

    this.status = 422;
    this.name = 'ValidationError';
  }
}

export class ValidationError<Data> extends ServerError<Data> {
  constructor(message?: string, data?: Data) {
    super(message ?? 'Unprocessable Entity', data);

    this.status = 422;
    this.name = 'ValidationError';
  }
}
