export class ServiceError extends Error {
  code: number;

  constructor(name = 'ServiceError', message: string, errorCode: number) {
    super(message);
    this.name = name;
    this.code = errorCode;
  }
}
