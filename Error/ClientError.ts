import ClientErrors from "./ClientErrors";

export default class ClientError extends Error {
  public code: number;

  public errors: ClientErrors;

  public constructor(code: number, message: string, errors: ClientErrors) {
    super(message);

    this.code = code;

    this.errors = errors;
  }
}
