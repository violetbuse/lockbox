import { OpenAPIHandler } from "@orpc/openapi/node";
import { router } from "./routes";
import { createServer } from "node:http";
import { ZodSmartCoercionPlugin } from "@orpc/zod";
import { OpenAPIReferencePlugin } from "@orpc/openapi/plugins";
import { ZodToJsonSchemaConverter } from "@orpc/zod/zod4";
import package_json from "../package.json";
import { create_db } from "./database";

export const start_server = (
  port: number,
  auth_key: string | null,
  db_url: string,
  lock_duration: number,
) => {
  const handler = new OpenAPIHandler(router, {
    plugins: [
      new ZodSmartCoercionPlugin(),
      new OpenAPIReferencePlugin({
        schemaConverters: [new ZodToJsonSchemaConverter()],
        specGenerateOptions: {
          info: {
            title: "Lockbox Playground",
            version: package_json.version,
          },
        },
      }),
    ],
  });

  const db = create_db(db_url);

  const server = createServer(async (req, res) => {
    const url = new URL(`http://lockbox${req.url!}`);

    const protected_route = url.pathname.startsWith("/mutex");

    const auth_header = req.headers.authorization;
    const auth_search_param = url.searchParams.get("auth_key");

    const auth = auth_header || auth_search_param;

    if (auth_key && auth !== auth_key && protected_route) {
      res.statusCode = 401;
      res.end("No Valid Auth Key");
      return;
    }

    const result = await handler.handle(req, res, {
      context: { db, lock_duration_secs: lock_duration },
    });

    if (!result.matched) {
      res.statusCode = 404;
      res.end("Route not found");
    }
  });

  server.listen(port, () => {
    console.log(`Lockbox started on port ${port}`);
  });
};
