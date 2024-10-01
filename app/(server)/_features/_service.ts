export class ServiceError extends Error {
  code: number;
  originalError?: Error;

  constructor(
    name = 'ServiceError',
    message: string,
    errorCode: number,
    originalError?: Error
  ) {
    super(message);
    this.name = name;
    this.code = errorCode;
    this.originalError = originalError;
  }
}
