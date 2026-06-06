import { main as lookupLineBind } from "./lookup-line-bind.js";
import { main as lookupResult } from "./lookup-result.js";

const argv = process.argv.slice(2);
const command = argv[0];
const main = command === "lookup-line-bind" ? lookupLineBind : lookupResult;

main(argv, {
  env: process.env,
  fetchImpl: fetch,
  stdout: process.stdout,
  stderr: process.stderr,
}).then((exitCode) => {
  process.exitCode = exitCode;
});
