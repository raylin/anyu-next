import { main } from "./lookup-result.js";

main(process.argv.slice(2), {
  env: process.env,
  fetchImpl: fetch,
  stdout: process.stdout,
  stderr: process.stderr,
}).then((exitCode) => {
  process.exitCode = exitCode;
});
