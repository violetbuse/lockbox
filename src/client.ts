import { createORPCClient } from "@orpc/client";
import { OpenAPILink } from "@orpc/openapi-client/fetch";
import type { JsonifiedClient } from "@orpc/openapi-client";
import { router } from "./routes";
import type { RouterClient } from "@orpc/server";
import fetch from "node-fetch";

export const create_client = (
  url: string,
  auth_key: string | null,
): JsonifiedClient<RouterClient<typeof router>> => {
  return createORPCClient(
    new OpenAPILink(router, {
      url,
      headers: () => {
        if (auth_key) {
          return {
            Authorization: auth_key,
          };
        } else {
          return {};
        }
      },
      // fetch: async (req, init) => {
      //   console.log(req);
      //   process.exit(1);
      // },
    }),
  );
};
