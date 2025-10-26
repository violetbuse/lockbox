import { Option } from "commander";
import { Command } from "commander";
import { start_server } from "../server";

export const server_command = new Command()
  .name("server")
  .addOption(
    new Option("-p, --port <number>", "port number")
      .default("8080")
      .env("PORT"),
  )
  .addOption(
    new Option(
      "-a, --auth-key <string>",
      "the auth key to verify requests against",
    ).env("LOCKBOX_AUTH_KEY"),
  )
  .addOption(
    new Option("-d, --db <file>", "the sqlite database file")
      .default("file:lockbox.db")
      .env("DB_FILE_NAME"),
  )
  .action((input) => {
    const port = parseInt(input.port);

    if (isNaN(port) || port < 0 || port > 65535) {
      console.error("Invalid port number");
      process.exit(1);
    }

    start_server(port, input.authKey || null, input.db);
  });
