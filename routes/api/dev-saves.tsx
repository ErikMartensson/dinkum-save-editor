import { define } from "../../utils.ts";

/**
 * Development-only API endpoint that lists .es3 and .json files in the selected-saves directory.
 * Returns 404 in production or if directory doesn't exist.
 */
export const handler = define.handlers({
  GET: async () => {
    // Only work in development
    if (Deno.env.get("DENO_DEPLOYMENT_ID") !== undefined) {
      return new Response("Not found", { status: 404 });
    }

    try {
      const files: string[] = [];

      // Try to read the directory
      for await (const entry of Deno.readDir("./selected-saves")) {
        if (
          entry.isFile &&
          (entry.name.endsWith(".es3") || entry.name.endsWith(".json"))
        ) {
          files.push(entry.name);
        }
      }

      return Response.json(files);
    } catch {
      // Directory doesn't exist or can't be read
      return new Response("Not found", { status: 404 });
    }
  },
});
