import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, type Plugin } from "vite";

/**
 * Development-only plugin that serves the selected-saves directory.
 *
 * Lets the DevAutoLoader component fetch save files from the project root,
 * replacing the dev middleware the old Fresh server had. It never runs in
 * production builds.
 */
function devSelectedSaves(): Plugin {
  return {
    name: "dev-selected-saves",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url ?? "/", "http://localhost");

        if (url.pathname === "/api/dev-saves") {
          try {
            const entries = await readdir("selected-saves", {
              withFileTypes: true,
            });
            const files = entries
              .filter(
                (entry) =>
                  entry.isFile() &&
                  (entry.name.endsWith(".es3") || entry.name.endsWith(".json")),
              )
              .map((entry) => entry.name);
            res.setHeader("content-type", "application/json");
            res.end(JSON.stringify(files));
          } catch {
            res.statusCode = 404;
            res.end("Not found");
          }
          return;
        }

        if (url.pathname.startsWith("/selected-saves/")) {
          const fileName = decodeURIComponent(
            url.pathname.slice("/selected-saves/".length),
          );
          if (fileName.includes("/") || fileName.includes("..")) {
            res.statusCode = 400;
            res.end("Bad request");
            return;
          }
          try {
            const data = await readFile(join("selected-saves", fileName));
            res.setHeader("content-type", "application/octet-stream");
            res.end(data);
          } catch {
            res.statusCode = 404;
            res.end("Not found");
          }
          return;
        }

        next();
      });
    },
  };
}

export default defineConfig({
  publicDir: "static",
  plugins: [tailwindcss(), devSelectedSaves()],
});
