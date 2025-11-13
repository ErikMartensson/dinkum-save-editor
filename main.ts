import { App, staticFiles } from "fresh";
import { type State } from "./utils.ts";

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

// Include file-system based routes here
app.fsRoutes();
