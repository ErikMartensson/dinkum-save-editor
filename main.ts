import { App, staticFiles } from "fresh";
import { define, type State } from "./utils.ts";

export const app = new App<State>();

app.use(staticFiles());

// Serve selected-saves directory for development auto-loading
// This allows the DevAutoLoader component to fetch save files
if (Deno.env.get("DENO_DEPLOYMENT_ID") === undefined) {
  app.use(async (ctx) => {
    const url = new URL(ctx.req.url);
    if (url.pathname.startsWith("/selected-saves/")) {
      const filePath = `.${url.pathname}`;
      try {
        const file = await Deno.readFile(filePath);
        return new Response(file, {
          headers: {
            "content-type": "application/octet-stream",
          },
        });
      } catch {
        // File not found, continue to next middleware
      }
    }
    return await ctx.next();
  });
}

// Pass a shared value from a middleware
app.use(async (ctx) => {
  ctx.state.shared = "hello";
  return await ctx.next();
});

// this is the same as the /api/:name route defined via a file. feel free to delete this!
app.get("/api2/:name", (ctx) => {
  const name = ctx.params.name;
  return new Response(
    `Hello, ${name.charAt(0).toUpperCase() + name.slice(1)}!`,
  );
});

// this can also be defined via a file. feel free to delete this!
const exampleLoggerMiddleware = define.middleware((ctx) => {
  console.log(`${ctx.req.method} ${ctx.req.url}`);
  return ctx.next();
});
app.use(exampleLoggerMiddleware);

// Include file-system based routes here
app.fsRoutes();
