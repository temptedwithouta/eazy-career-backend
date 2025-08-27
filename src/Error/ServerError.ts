export default class ServerError extends Error {
  public code: number;

  public constructor(code: number, message: string) {
    super(message);

    this.name = "ServerError";

    this.code = code;
  }
}
