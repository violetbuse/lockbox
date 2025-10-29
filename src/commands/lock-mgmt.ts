import { Argument } from "commander";
import { Option } from "commander";
import { Command } from "commander";
import { create_client } from "../client";

const url_option = new Option(
  "-u, --url <address>",
  "the url of the lockbox server",
)
  .default("http://localhost:8080")
  .env("LOCKBOX_URL");
const auth_key = new Option(
  "-a, --auth-key <key>",
  "the auth key of the server",
).env("LOCKBOX_AUTH_KEY");

const resource = new Argument("<resource>", "the resource to lock");
const nonce = new Argument(
  "<nonce>",
  "the nonce identifying you as the lock holder",
);

const lock_command = new Command()
  .name("acquire")
  .addArgument(resource)
  .addOption(url_option)
  .addOption(auth_key)
  .action(async (resource, options) => {
    const client = create_client(options.url, options.authKey || null);
    const result = await client.acquire_mutex({
      params: { resource_id: resource },
    });

    switch (result.status) {
      case "failure": {
        console.error("Failed to lock resource.");
        process.exit(1);
      }
      case "success": {
        const expires_at = new Date(result.data.expires_at * 1000);

        console.log("Locked resource.");
        console.log(`nonce: ${result.data.nonce}`);
        console.log(
          `expires_at: ${expires_at.toTimeString()} ${expires_at.toDateString()}`,
        );
      }
    }
  });

const get_lock_command = new Command()
  .name("get")
  .addArgument(resource)
  .addOption(url_option)
  .addOption(auth_key)
  .action(async (resource, options) => {
    const client = create_client(options.url, options.authKey || null);
    const result = await client.get_mutex({
      params: { resource_id: resource },
    });

    if (!result.data) {
      console.error("Could not get lock.");
      process.exit(1);
    }

    const expires_at = new Date(result.data.expires_at * 1000);

    console.log(`nonce: ${result.data.nonce}`);
    console.log(
      `expires_at: ${expires_at.toTimeString()} ${expires_at.toDateString()}`,
    );
  });

const refresh_command = new Command()
  .name("refresh")
  .addArgument(resource)
  .addArgument(nonce)
  .addOption(url_option)
  .addOption(auth_key)
  .action(async (resource, nonce, options) => {
    const client = create_client(options.url, options.authKey || null);
    const result = await client.refresh_mutex({
      params: { resource_id: resource, nonce },
    });

    switch (result.status) {
      case "failure": {
        console.error("Failed to lock resource.");
        process.exit(1);
      }
      case "success": {
        const expires_at = new Date(result.data.expires_at * 1000);

        console.log("Locked resource.");
        console.log(`nonce: ${result.data.nonce}`);
        console.log(
          `expires_at: ${expires_at.toTimeString()} ${expires_at.toDateString()}`,
        );
      }
    }
  });

const release_command = new Command()
  .name("release")
  .addArgument(resource)
  .addArgument(nonce)
  .addOption(url_option)
  .addOption(auth_key)
  .action(async (resource, nonce, options) => {
    const client = create_client(options.url, options.authKey || null);
    const result = await client.release_mutex({
      params: { resource_id: resource, nonce },
    });

    switch (result.status) {
      case "failure": {
        console.error("Failed to lock resource.");
        process.exit(1);
      }
      case "success": {
        console.log("Released lock.");
      }
    }
  });

export const lock_commands = new Command()
  .name("mutex")
  .addCommand(lock_command)
  .addCommand(get_lock_command)
  .addCommand(refresh_command)
  .addCommand(release_command);
