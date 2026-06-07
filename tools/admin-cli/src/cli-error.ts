export class CliError extends Error {
  constructor(
    readonly code: string,
    readonly exitCode = 1,
    message = code,
  ) {
    super(message);
  }
}
