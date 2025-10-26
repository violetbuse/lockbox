import { os } from "@orpc/server";
import { z } from "zod";
import { nanoid } from "nanoid";
import type { DB } from "./database";
import { eq } from "drizzle-orm";
import { mutex_table } from "./schema";
import { and } from "drizzle-orm";
import { delete_if_expired } from "./util";
import { count } from "drizzle-orm";

const base = os.$context<{ db: DB }>().$route({ inputStructure: "detailed" });

const TWO_MINUTES = 2 * 60 * 1000;

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
  .handler(
    async ({
      input: {
        params: { resource_id },
      },
      context: { db },
    }) => {
      try {
        await delete_if_expired(db, resource_id);

        const result = await db
          .insert(mutex_table)
          .values({
            resource: resource_id,
            nonce: nanoid(),
            expires_at: new Date(Date.now() + TWO_MINUTES),
          })
          .returning()
          .get();
        return {
          status: "success",
          data: {
            nonce: result.nonce,
            expires_at: Math.round(result.expires_at.getTime() / 1000),
          },
        };
      } catch (error) {
        console.error(error);
        return { status: "failure" };
      }
    },
  );

const get_mutex = base
  .route({
    method: "GET",
    path: "/mutex/{resource_id}",
    description: "Query a mutex",
    tags: ["Mutex"],
  })
  .input(
    z.object({
      params: z.object({ resource_id: z.string().min(1) }),
    }),
  )
  .output(
    z.object({
      data: z
        .object({
          nonce: z.string(),
          expires_at: z.int(),
        })
        .nullable(),
    }),
  )
  .handler(
    async ({
      input: {
        params: { resource_id },
      },
      context: { db },
    }) => {
      const result = await db.query.mutex_table.findFirst({
        where: eq(mutex_table.resource, resource_id),
      });

      if (!result) {
        return { data: null };
      }

      if (result.expires_at < new Date()) {
        return { data: null };
      }

      return {
        data: {
          nonce: result.nonce,
          expires_at: Math.round(result.expires_at.getTime() / 1000),
        },
      };
    },
  );

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
  .handler(
    async ({
      input: {
        params: { resource_id, nonce },
      },
      context: { db },
    }) => {
      try {
        await delete_if_expired(db, resource_id);

        await db
          .update(mutex_table)
          .set({
            expires_at: new Date(Date.now() + TWO_MINUTES),
          })
          .where(
            and(
              eq(mutex_table.resource, resource_id),
              eq(mutex_table.nonce, nonce),
            ),
          );

        const result = await db.query.mutex_table.findFirst({
          where: and(
            eq(mutex_table.resource, resource_id),
            eq(mutex_table.nonce, nonce),
          ),
        });

        if (!result) {
          return { status: "failure" };
        }

        return {
          status: "success",
          data: {
            nonce: result.nonce,
            expires_at: Math.floor(result.expires_at.getTime() / 1000),
          },
        };
      } catch (error) {
        console.error(error);
        return { status: "failure" };
      }
    },
  );

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
  .handler(
    async ({
      input: {
        params: { resource_id, nonce },
      },
      context: { db },
    }) => {
      try {
        await delete_if_expired(db, resource_id);

        const current_state = await db.query.mutex_table.findFirst({
          where: eq(mutex_table.resource, resource_id),
        });

        if (!current_state) {
          return { status: "success" };
        }

        if (current_state.resource !== nonce) {
          return { status: "success" };
        }

        await db
          .delete(mutex_table)
          .where(
            and(
              eq(mutex_table.resource, resource_id),
              eq(mutex_table.nonce, nonce),
            ),
          );

        return { status: "success" };
      } catch (error) {
        console.error(error);
        return { status: "failure" };
      }
    },
  );

const health_check = base
  .route({
    method: "GET",
    path: "/health-check",
  })
  .output(z.object({ status: z.literal("success") }))
  .handler(async ({ context: { db } }) => {
    const result = db.select({ count: count() }).from(mutex_table).get();
    return { status: "success" };
  });

export const router = {
  acquire_mutex,
  get_mutex,
  refresh_mutex,
  release_mutex,
  health_check,
};
