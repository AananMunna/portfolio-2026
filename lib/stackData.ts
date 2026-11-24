/** Tech stack list + the code that "types itself" in the terminal on hover. */

export interface Tech {
  name: string;
  file: string;
  lang: string;
  use: string;
  code: string;
  cmd: string;
  out: string;
}

export interface TechGroup {
  title: string;
  items: Tech[];
}

export const stack: TechGroup[] = [
  {
    title: "Languages",
    items: [
      {
        name: "TypeScript",
        file: "types.ts",
        lang: "TypeScript",
        use: "Shared types, front to back",
        code: `export type ShipmentStatus =
  | "PENDING"
  | "ASSIGNED"
  | "PICKED_UP"
  | "IN_TRANSIT"
  | "DELIVERED";

export interface Shipment {
  id: string;
  trackingCode: string;
  status: ShipmentStatus;
  riderId: string | null;
}`,
        cmd: "tsc --noEmit",
        out: "✓ 0 errors. Types check out.",
      },
      {
        name: "JavaScript",
        file: "utils.js",
        lang: "JavaScript",
        use: "ES2024, async by default",
        code: `const retry = async (fn, tries = 3) => {
  for (let i = 0; i < tries; i++) {
    try {
      return await fn();
    } catch (err) {
      if (i === tries - 1) throw err;
      await new Promise((r) => setTimeout(r, 2 ** i * 200));
    }
  }
};`,
        cmd: "node utils.js",
        out: "✓ retried 2x, resolved on attempt 3",
      },
    ],
  },
  {
    title: "Frontend",
    items: [
      {
        name: "React",
        file: "Timeline.tsx",
        lang: "TSX",
        use: "Component-driven UI",
        code: `export function Timeline({ events }: Props) {
  return (
    <ol className="space-y-4">
      {events.map((e) => (
        <li key={e.id} className="flex gap-3">
          <StatusDot status={e.status} />
          <span>{e.label}</span>
        </li>
      ))}
    </ol>
  );
}`,
        cmd: "npm run test",
        out: "✓ 12 passed",
      },
      {
        name: "Next.js",
        file: "page.tsx",
        lang: "TSX",
        use: "App Router, server actions",
        code: `export default async function TrackPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const shipment = await getShipment(code);

  if (!shipment) notFound();

  return <Timeline events={shipment.events} />;
}`,
        cmd: "next build",
        out: "✓ Compiled successfully",
      },
      {
        name: "Tailwind CSS",
        file: "Button.tsx",
        lang: "TSX",
        use: "Design tokens, no CSS sprawl",
        code: `<button
  className="
    inline-flex items-center gap-2 rounded-full
    bg-emerald-600 px-5 py-2.5 text-sm font-semibold
    text-white transition hover:-translate-y-0.5
    hover:bg-emerald-500 active:scale-95
  "
>
  Send message
</button>`,
        cmd: "tailwindcss --minify",
        out: "✓ Done in 94ms",
      },
      {
        name: "Redux",
        file: "cartSlice.ts",
        lang: "TypeScript",
        use: "Predictable client state",
        code: `const cartSlice = createSlice({
  name: "cart",
  initialState: { items: [] as CartItem[] },
  reducers: {
    added(state, { payload }: PayloadAction<CartItem>) {
      state.items.push(payload);
    },
    removed(state, { payload }: PayloadAction<string>) {
      state.items = state.items.filter((i) => i.id !== payload);
    },
  },
});`,
        cmd: "npm run lint",
        out: "✓ no warnings",
      },
    ],
  },
  {
    title: "Backend",
    items: [
      {
        name: "Node.js",
        file: "server.ts",
        lang: "TypeScript",
        use: "APIs that stay up",
        code: `const server = app.listen(PORT, () => {
  logger.info(\`API ready on :\${PORT}\`);
});

process.on("SIGTERM", () => {
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
});`,
        cmd: "node dist/server.js",
        out: "API ready on :5000",
      },
      {
        name: "Express.js",
        file: "shipment.routes.ts",
        lang: "TypeScript",
        use: "Routes, middleware, services",
        code: `router.patch("/:id/assign", requireRole("ADMIN"), async (req, res) => {
  const { riderId } = assignSchema.parse(req.body);

  const result = await prisma.shipment.updateMany({
    where: { id: req.params.id, status: "PENDING" },
    data: { riderId, status: "ASSIGNED" },
  });

  if (result.count === 0) throw new ConflictError("Already assigned");
  res.json({ ok: true });
});`,
        cmd: "curl -X PATCH :5000/shipments/42/assign",
        out: '{ "ok": true }',
      },
      {
        name: "REST API design",
        file: "openapi.yml",
        lang: "YAML",
        use: "Predictable, documented endpoints",
        code: `paths:
  /shipments/{id}:
    get:
      summary: Get one shipment
      parameters:
        - name: id
          in: path
          required: true
      responses:
        "200": { description: OK }
        "404": { description: Not found }`,
        cmd: "spectral lint openapi.yml",
        out: "✓ No results with a severity of 'error'",
      },
    ],
  },
  {
    title: "Data",
    items: [
      {
        name: "PostgreSQL",
        file: "query.sql",
        lang: "SQL",
        use: "Relational data, real constraints",
        code: `SELECT s.tracking_code,
       s.status,
       r.name AS rider
FROM   shipments s
LEFT   JOIN riders r ON r.id = s.rider_id
WHERE  s.status = 'IN_TRANSIT'
ORDER  BY s.created_at DESC
LIMIT  20;`,
        cmd: "psql -f query.sql",
        out: "(20 rows) · 3.1 ms",
      },
      {
        name: "Prisma",
        file: "schema.prisma",
        lang: "Prisma",
        use: "Typed queries, safe migrations",
        code: `model Shipment {
  id           String          @id @default(cuid())
  trackingCode String          @unique
  status       ShipmentStatus  @default(PENDING)
  riderId      String?
  events       TrackingEvent[]
  createdAt    DateTime        @default(now())

  @@index([status, createdAt])
}`,
        cmd: "prisma migrate dev",
        out: "✓ Your database is now in sync",
      },
      {
        name: "MongoDB",
        file: "user.model.js",
        lang: "JavaScript",
        use: "Flexible documents, fast to ship",
        code: `const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
  },
  { timestamps: true }
);

export default model("User", userSchema);`,
        cmd: "mongosh --eval 'db.users.countDocuments()'",
        out: "128",
      },
      {
        name: "Redis",
        file: "otp.ts",
        lang: "TypeScript",
        use: "OTPs, rate limits, caching",
        code: `export async function saveOtp(email: string, otp: string) {
  // expires in 5 minutes
  await redis.set(\`otp:\${email}\`, otp, "EX", 300);
}

export async function verifyOtp(email: string, input: string) {
  const saved = await redis.get(\`otp:\${email}\`);
  if (saved !== input) return false;
  await redis.del(\`otp:\${email}\`);
  return true;
}`,
        cmd: "redis-cli TTL otp:me@mail.com",
        out: "(integer) 287",
      },
    ],
  },
  {
    title: "Auth & payments",
    items: [
      {
        name: "JWT & RBAC",
        file: "auth.middleware.ts",
        lang: "TypeScript",
        use: "Cookies, roles, protected routes",
        code: `export const requireRole =
  (...roles: Role[]) =>
  (req: Request, _res: Response, next: NextFunction) => {
    const token = req.cookies.accessToken;
    if (!token) throw new UnauthorizedError();

    const user = jwt.verify(token, env.JWT_SECRET) as JwtUser;
    if (!roles.includes(user.role)) throw new ForbiddenError();

    req.user = user;
    next();
  };`,
        cmd: "npm run test:auth",
        out: "✓ 9 passed",
      },
      {
        name: "Stripe",
        file: "webhook.ts",
        lang: "TypeScript",
        use: "Checkout + verified webhooks",
        code: `const event = stripe.webhooks.constructEvent(
  req.body,
  req.headers["stripe-signature"] as string,
  env.STRIPE_WEBHOOK_SECRET
);

if (event.type === "checkout.session.completed") {
  const session = event.data.object;
  await markRentalPaid(session.metadata.rentalId);
}`,
        cmd: "stripe listen --forward-to :5000/webhook",
        out: "✓ checkout.session.completed [200]",
      },
    ],
  },
  {
    title: "Shipping",
    items: [
      {
        name: "GitHub Actions",
        file: "ci.yml",
        lang: "YAML",
        use: "Typecheck + build on every push",
        code: `name: CI
on: [push, pull_request]

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22 }
      - run: npm ci
      - run: npx tsc --noEmit
      - run: npm run build`,
        cmd: "gh run watch",
        out: "✓ check completed in 1m 12s",
      },
      {
        name: "Git",
        file: "terminal",
        lang: "Shell",
        use: "Small commits, clean history",
        code: `git switch -c feat/rider-earnings
git add -p
git commit -m "feat: rider earnings summary"
git rebase origin/main
git push -u origin feat/rider-earnings`,
        cmd: "git log --oneline -1",
        out: "a1b2c3d feat: rider earnings summary",
      },
      {
        name: "Vercel",
        file: "next.config.ts",
        lang: "TypeScript",
        use: "Preview every branch, ship on merge",
        code: `const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: \`\${process.env.API_URL}/:path*\`,
      },
    ];
  },
};

export default nextConfig;`,
        cmd: "vercel --prod",
        out: "✓ Production ready, deployed in 38s",
      },
    ],
  },
];
