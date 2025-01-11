import { Command } from "https://deno.land/x/cliffy@v1.0.0-rc.3/command/mod.ts";

const program = new Command()
  .name("one")
  .version("1.0.0")
  .description("Personal CLI tools collection");

// Add your commands here
// Example:
// program
//   .command("hello")
//   .description("Say hello")
//   .action(() => console.log("Hello!"));

if (import.meta.main) {
  program.parse(Deno.args);
}
