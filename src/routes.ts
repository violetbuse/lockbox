import { os } from "@orpc/server";
import { z } from "zod";
import type { DB } from "./database";

const base = os.$context<{ db: DB }>().$route({ inputStructure: "detailed" });

const acquire_mutex = base
  .route({
    method: "POST",
    path: "/mutex/{resource_id}",
    description: "Acquire a mutex",
    tags: ["Mutex"],
  })
  .input(
    z.object({
      params: z.object({ resource_id: z.string().min(1) }),
    }),
  )
  .output(
    z.discriminatedUnion("status", [
      z.object({
        status: z.literal("success"),
        data: z.object({
          nonce: z.string(),
          expires_at: z.int(),
        }),
      }),
      z.object({ status: z.literal("failure") }),
    ]),
  )
  .handler(async ({ input, context }) => {
    throw new Error("Not implemented");
  });

const get_mutex = base
  .route({
    method: "GET",
    path: "/mutex/{resource_id}",
    description: "Get a mutex",
    tags: ["Mutex"],
  })
  .input(
    z.object({
      params: z.object({ resource_id: z.string().min(1) }),
    }),
  )
  .output(
    z.discriminatedUnion("status", [
      z.object({
        status: z.literal("success"),
        data: z.object({
          nonce: z.string(),
          expires_at: z.int(),
        }),
      }),
      z.object({ status: z.literal("failure") }),
    ]),
  )
  .handler(async ({ input, context }) => {
    throw new Error("Not implemented");
  });

const refresh_mutex = base
  .route({
    method: "POST",
    path: "/mutex/{resource_id}/{nonce}",
    description: "Refresh a mutex",
    tags: ["Mutex"],
  })
  .input(
    z.object({
      params: z.object({
        resource_id: z.string().min(1),
        nonce: z.string().min(1),
      }),
    }),
  )
  .output(
    z.discriminatedUnion("status", [
      z.object({
        status: z.literal("success"),
        data: z.object({
          nonce: z.string(),
          expires_at: z.int(),
        }),
      }),
      z.object({ status: z.literal("failure") }),
    ]),
  )
  .handler(async ({ input, context }) => {
    throw new Error("Not implemented");
  });

const release_mutex = base
  .route({
    method: "DELETE",
    path: "/mutex/{resource_id}/{nonce}",
    description: "Release a mutex",
    tags: ["Mutex"],
  })
  .input(
    z.object({
      params: z.object({
        resource_id: z.string().min(1),
        nonce: z.string().min(1),
      }),
    }),
  )
  .output(
    z.object({
      status: z.union([z.literal("failure"), z.literal("success")]),
    }),
  )
  .handler(async ({ input, context }) => {
    throw new Error("Not implemented");
  });

export const router = {
  acquire_mutex,
  get_mutex,
  refresh_mutex,
  release_mutex,
};
