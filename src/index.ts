import "dotenv/config";
import { OpenAPIHandler } from "@orpc/openapi/node";
import { router } from "./routes";
import { createServer } from "node:http";
import { ZodSmartCoercionPlugin } from "@orpc/zod";
import { OpenAPIReferencePlugin } from "@orpc/openapi/plugins";
import { ZodToJsonSchemaConverter } from "@orpc/zod/zod4";
import package_json from "../package.json";
import { create_db } from "./database";
import { get_auth_key } from "./auth";

const port = 8080;

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

const db = create_db();

const server = createServer(async (req, res) => {
  const auth_header = req.headers.authorization;
  const auth_search_param = new URL(
    `http://lockbox${req.url!}`,
  ).searchParams.get("auth_key");

  const auth = auth_header || auth_search_param;

  if (auth !== get_auth_key()) {
    res.statusCode = 401;
    res.end("No Valid Auth Key");
    return;
  }

  const result = await handler.handle(req, res, {
    context: { db },
  });

  if (!result.matched) {
    res.statusCode = 404;
    res.end("Route not found");
  }
});

server.listen(8080, () => {
  console.log(`Lockbox started on port ${port}`);
});
