#!/usr/bin/env node

import "dotenv/config";
import { Command } from "commander";
import { server_command } from "./commands/server";
import { lock_commands } from "./commands/lock-mgmt";

const program = new Command()
  .name("lockbox")
  .addCommand(server_command)
  .addCommand(lock_commands);

program.parse(process.argv);
