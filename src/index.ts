import { OpenAPIHandler } from "@orpc/openapi/node";
import { router } from "./routes";
import { createServer } from "node:http";
import { ZodSmartCoercionPlugin } from "@orpc/zod";
import { OpenAPIReferencePlugin } from "@orpc/openapi/plugins";
import { ZodToJsonSchemaConverter } from "@orpc/zod/zod4";
import package_json from "../package.json";

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

const server = createServer(async (req, res) => {
  const result = await handler.handle(req, res, {
    context: {},
  });

  if (!result.matched) {
    res.statusCode = 404;
    res.end("Route not found");
  }
});

server.listen(8080, () => {
  console.log(`Lockbox started on port ${port}`);
});
