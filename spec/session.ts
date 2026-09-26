import { spawn } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { type AddressInfo, createServer } from "node:net";
import { tmpdir } from "node:os";
import { join } from "node:path";

/** One browser: it keeps whatever cookie the server gave it, and nothing else. */
export class Visitor {
  private cookie: string | undefined;
  constructor(private readonly baseUrl: string) {}

  private remember(res: Response): void {
    const header = res.headers.getSetCookie?.() ?? [];
    for (const entry of header) {
      const [pair] = entry.split(";");
      if (pair?.startsWith("sto_visitor=")) this.cookie = pair;
    }
  }

  async get(path: string): Promise<Response> {
    const res = await fetch(new URL(path, this.baseUrl), {
      headers: this.cookie ? { cookie: this.cookie } : {},
      redirect: "manual",
    });
    this.remember(res);
    return res;
  }

  async text(path: string): Promise<string> {
    return (await this.get(path)).text();
  }

  /** Astro checks form POSTs carry a same-origin Origin header (CSRF
   *  protection); browsers send it automatically, a bare fetch does not. */
  async post(path: string, fields: Record<string, string>): Promise<Response> {
    const res = await fetch(new URL(path, this.baseUrl), {
      method: "POST",
      headers: {
        origin: this.baseUrl,
        ...(this.cookie ? { cookie: this.cookie } : {}),
      },
      body: new URLSearchParams(fields),
      redirect: "manual",
    });
    this.remember(res);
    return res;
  }

  get cookieValue(): string | undefined {
    return this.cookie;
  }
}

export type Running = { baseUrl: string; stop: () => Promise<void> };

async function freePort(): Promise<number> {
  return new Promise((resolve) => {
    const probe = createServer();
    probe.listen(0, () => {
      const address = probe.address() as AddressInfo;
      probe.close(() => resolve(address.port));
    });
  });
}

/** Boot another copy of the built server against a database path of our
 *  choosing — which is how the restart test can actually restart something. */
export async function startServer(databasePath: string): Promise<Running> {
  const port = await freePort();
  const server = spawn("node", ["./dist/server/entry.mjs"], {
    env: { ...process.env, HOST: "127.0.0.1", PORT: String(port), DATABASE_PATH: databasePath },
    stdio: "ignore",
  });
  const baseUrl = `http://127.0.0.1:${port}`;
  for (let attempt = 0; ; attempt++) {
    try {
      if ((await fetch(baseUrl)).ok) break;
    } catch {
      /* not up yet */
    }
    if (attempt >= 60) {
      server.kill();
      throw new Error(`server did not come up at ${baseUrl}`);
    }
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  return {
    baseUrl,
    stop: () =>
      new Promise((resolve) => {
        server.once("exit", () => resolve());
        server.kill();
      }),
  };
}

export const scratchDatabase = (): string =>
  join(mkdtempSync(join(tmpdir(), "spec-restart-")), "app.db");
