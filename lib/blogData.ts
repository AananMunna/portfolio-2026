/**
 * Blog posts: original write-ups of problems I hit while building CourierGo and
 * RentNest. Code samples are simplified. Edit freely: these are meant to sound
 * like you, so change anything that doesn't.
 */

export type Block =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "callout"; kind: "note" | "warning"; text: string }
  | { type: "code"; file?: string; text: string };

export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  tags: string[];
  excerpt: string;
  cover: string;
  content: Block[];
}

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export const readingTime = (post: BlogPost) => {
  const words = post.content
    .map((b) => ("text" in b ? b.text : b.items.join(" ")))
    .join(" ")
    .split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
};

export const posts: BlogPost[] = [
  {
    slug: "two-admins-one-parcel",
    title: "Two admins, one parcel: stopping double assignments in CourierGo",
    date: "Nov 24, 2026",
    tags: ["Backend", "PostgreSQL", "Prisma"],
    excerpt:
      "What happens when two admins click “assign rider” on the same parcel at the same second, and the small change that fixed it.",
    cover: "/blog/two-admins-one-parcel.svg",
    content: [
      {
        type: "p",
        text: "CourierGo has three kinds of users: customers who book parcels, riders who deliver them, and admins who connect the two. The admin's main job is simple. Open the list of pending parcels, pick one, pick a rider, click assign. I built that flow early and it worked every time I tried it. Then I thought about what happens when there is more than one admin.",
      },
      { type: "h2", text: "The setup" },
      {
        type: "p",
        text: "A parcel starts as PENDING. When an admin assigns a rider, the parcel gets that rider's id and its status becomes ASSIGNED. The rider then sees it in their queue. On paper that is one update to one row.",
      },
      {
        type: "p",
        text: "The trouble is that admins don't work one at a time. Two of them can have the same pending list open, and both can pick the same parcel. They might even pick different riders.",
      },
      { type: "h2", text: "What went wrong" },
      {
        type: "p",
        text: "My first version of the assign endpoint did what most of us would write on the first try: load the parcel, check that it is still PENDING, then save the new rider and status.",
      },
      {
        type: "code",
        file: "assign.ts (first version)",
        text: `const shipment = await prisma.shipment.findUnique({ where: { id } });

if (shipment.status !== "PENDING") {
  throw new ConflictError("Parcel is no longer pending");
}

await prisma.shipment.update({
  where: { id },
  data: { riderId, status: "ASSIGNED" },
});`,
      },
      {
        type: "p",
        text: "Every line is reasonable. The bug lives in the space between the first query and the last one. If two requests arrive close together, both can run the findUnique before either runs the update. Both see PENDING, both pass the check, and both write. The second write wins and the first admin's choice disappears without any error.",
      },
      {
        type: "ul",
        items: [
          "Admin A assigns the parcel to Rider 1 and sees a success message.",
          "Admin B assigns the same parcel to Rider 2 a moment later and also sees success.",
          "Rider 1 might have already seen the parcel in their queue, and now it is gone.",
        ],
      },
      {
        type: "callout",
        kind: "note",
        text: "This kind of bug never shows up when you test alone. You click, it works, you move on. It needs two people, or two requests, at nearly the same time.",
      },
      { type: "h2", text: "Options I considered" },
      {
        type: "p",
        text: "The first thing that comes to mind is a lock: lock the row, do the check, write, release. That works, but it adds code I'd have to get right, and I'd be holding database locks while my application code runs. For this problem it felt like too much machinery.",
      },
      {
        type: "p",
        text: "The simpler idea is to stop treating the check and the write as two separate steps. Let the write itself say what it expects: update this parcel only if it is still PENDING.",
      },
      { type: "h2", text: "The fix" },
      {
        type: "code",
        file: "assign.ts",
        text: `const result = await prisma.shipment.updateMany({
  where: { id, status: "PENDING" },
  data: { riderId, status: "ASSIGNED" },
});

if (result.count === 0) {
  throw new ConflictError("This parcel was already assigned");
}`,
      },
      {
        type: "p",
        text: "I use updateMany instead of update because it doesn't throw when nothing matches. It returns how many rows it changed. If the answer is zero, someone else got there first.",
      },
      {
        type: "p",
        text: "The database decides who wins, in a single statement. The first request flips the status to ASSIGNED. The second request looks for a PENDING parcel with that id, finds none, and changes nothing. There is no gap between checking and writing, because they are the same operation.",
      },
      { type: "h2", text: "Showing the conflict properly" },
      {
        type: "p",
        text: "A failed assignment shouldn't look like a crash. The API returns a 409 with a short message, and the admin dashboard shows it as “This parcel was already assigned” and refreshes the list. The admin who lost the race sees who got the parcel and moves on to the next one.",
      },
      { type: "h2", text: "How I checked it" },
      {
        type: "p",
        text: "I didn't want to trust my reasoning alone, so I fired two assign requests at the same time against the same parcel and looked at the results.",
      },
      {
        type: "code",
        file: "race.test.ts",
        text: `const [a, b] = await Promise.allSettled([
  assign(parcelId, riderOne),
  assign(parcelId, riderTwo),
]);

const succeeded = [a, b].filter((r) => r.status === "fulfilled");
expect(succeeded).toHaveLength(1);`,
      },
      {
        type: "p",
        text: "Exactly one succeeds and the other fails with a conflict. With the original version, both could succeed.",
      },
      { type: "h2", text: "What I took from it" },
      {
        type: "p",
        text: "Whenever I write “read, check, then write”, I now stop and ask what happens if two people do this at once. Most of the time the answer is a where clause that carries the state I expect. It's a small habit, and it has saved me from a few bugs that would have been painful to find in production.",
      },
    ],
  },
  {
    slug: "parcels-cant-skip-steps",
    title: "Why parcels in CourierGo can't skip steps",
    date: "Nov 24, 2026",
    tags: ["Backend", "System design"],
    excerpt:
      "A small transition map that keeps delivery statuses honest, so nothing jumps from PENDING straight to DELIVERED.",
    cover: "/blog/parcels-cant-skip-steps.svg",
    content: [
      {
        type: "p",
        text: "A parcel in CourierGo has a life. It is booked, assigned to a rider, picked up, carried across the city, brought to the door, and finally delivered, or the delivery fails. Each of those moments is a status, and customers see them on the public tracking page. If the statuses can't be trusted, the whole product can't be trusted.",
      },
      { type: "h2", text: "The statuses" },
      {
        type: "ul",
        items: [
          "PENDING: the customer has booked, no rider yet.",
          "ASSIGNED: an admin has picked a rider.",
          "PICKED_UP: the rider has the parcel.",
          "IN_TRANSIT: on its way between hubs.",
          "OUT_FOR_DELIVERY: with the rider for the final stretch.",
          "DELIVERED or FAILED: the end of the road.",
        ],
      },
      { type: "h2", text: "The problem with “any valid status”" },
      {
        type: "p",
        text: "My first status endpoint validated the input with a schema. If the body said status: DELIVERED, the schema was happy, because DELIVERED is a real value. Nothing checked where the parcel was coming from.",
      },
      {
        type: "p",
        text: "That means a bug in the rider screen, or someone sending a hand-made request, could mark an unassigned parcel as delivered. The tracking page would then show a delivery that never happened. Validating the shape of the data wasn't enough. I also had to validate the move.",
      },
      { type: "h2", text: "A map of allowed moves" },
      {
        type: "p",
        text: "I wrote down, for every status, the statuses it is allowed to become next. It's just an object.",
      },
      {
        type: "code",
        file: "shipment-status.ts",
        text: `const NEXT: Record<Status, Status[]> = {
  PENDING: ["ASSIGNED"],
  ASSIGNED: ["PICKED_UP"],
  PICKED_UP: ["IN_TRANSIT"],
  IN_TRANSIT: ["OUT_FOR_DELIVERY"],
  OUT_FOR_DELIVERY: ["DELIVERED", "FAILED"],
  DELIVERED: [],
  FAILED: [],
};

export function canMove(from: Status, to: Status) {
  return NEXT[from].includes(to);
}`,
      },
      {
        type: "p",
        text: "Reading it top to bottom tells you the whole story of a parcel. DELIVERED and FAILED have empty lists, so nothing leaves them. There is also no entry that goes backwards.",
      },
      { type: "h2", text: "Where the check lives" },
      {
        type: "p",
        text: "I put the check in the service layer, not in the route handler. The handler only deals with HTTP: who is calling and what did they send. The service decides whether the move makes sense. That way any code that changes a status, now or later, goes through the same door.",
      },
      {
        type: "code",
        file: "shipment.service.ts",
        text: `export async function moveShipment(id: string, to: Status) {
  const shipment = await getShipment(id);

  if (!canMove(shipment.status, to)) {
    throw new BadRequestError(
      \`Can't move a parcel from \${shipment.status} to \${to}\`
    );
  }

  // update + tracking event happen together
}`,
      },
      {
        type: "callout",
        kind: "note",
        text: "The transition check and the double-assignment fix work together. The update still includes the expected current status in its where clause, so two requests can't both move the same parcel from the same starting point.",
      },
      { type: "h2", text: "Tracking events are never edited" },
      {
        type: "p",
        text: "Every successful move also writes a tracking event: the new status, and when it happened. I never update or delete those rows. That gives the public tracking page a real timeline, and it gives me something solid to look at when a customer says “it says delivered but I never got it”.",
      },
      { type: "h2", text: "Using the same map in the UI" },
      {
        type: "p",
        text: "On the frontend, the rider's screen only shows the next valid action. A rider with a PICKED_UP parcel sees one button: start transit. They never get a menu of seven statuses to pick from. The backend would reject a wrong move anyway, but there is no reason to offer it.",
      },
      { type: "h2", text: "What changed" },
      {
        type: "p",
        text: "It's a tiny amount of code. But it moved a whole class of bugs from “possible” to “not possible”, and that's the kind of change I like most. When someone asks what states a parcel can be in, I can answer by pointing at one object instead of searching the codebase.",
      },
    ],
  },
  {
    slug: "dont-trust-the-stripe-redirect",
    title: "Don't trust the Stripe redirect: handling payments in RentNest",
    date: "Nov 24, 2026",
    tags: ["Stripe", "Next.js", "Express"],
    excerpt:
      "Why RentNest confirms payments with a signed webhook instead of the page the user lands on after checkout.",
    cover: "/blog/dont-trust-the-stripe-redirect.svg",
    content: [
      {
        type: "p",
        text: "RentNest is a rental marketplace. Landlords list properties, tenants send a rental request, and once a request is approved the tenant pays through Stripe Checkout. Payments are the part where mistakes cost real money, so I spent more time on this flow than on most others.",
      },
      { type: "h2", text: "The flow" },
      {
        type: "ul",
        items: [
          "The tenant clicks pay and the server creates a Checkout Session.",
          "The browser is sent to Stripe's hosted page.",
          "After paying, Stripe sends the browser back to a success URL on our site.",
        ],
      },
      {
        type: "p",
        text: "At that last step it is very tempting to say: they landed on the success page, so the payment worked, so mark it as paid. I did exactly that in my first draft.",
      },
      { type: "h2", text: "Why the redirect isn't proof" },
      {
        type: "p",
        text: "Think about what the success page really knows. It knows that somebody's browser opened a URL. That's all.",
      },
      {
        type: "ul",
        items: [
          "Anyone can type the success URL by hand and ‘pay’ without paying.",
          "A real customer can pay and close the tab before the redirect, so we never hear about a payment that did happen.",
          "The tenant's connection can drop right after paying. The money moved, our database didn't.",
        ],
      },
      {
        type: "p",
        text: "In one case we record a payment that never happened. In another we miss one that did. Neither is acceptable for a rental that reserves a property.",
      },
      { type: "h2", text: "Let Stripe tell the server" },
      {
        type: "p",
        text: "Stripe can call an endpoint on our backend when something happens to a payment. That call goes server to server, so it doesn't depend on the tenant's browser at all. RentNest now treats this webhook as the only source of truth.",
      },
      {
        type: "code",
        file: "stripe.webhook.ts",
        text: `app.post(
  "/webhooks/stripe",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    let event;
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        req.headers["stripe-signature"] as string,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch {
      return res.sendStatus(400);
    }

    if (event.type === "checkout.session.completed") {
      await markPaymentPaid(event.data.object);
    }

    res.sendStatus(200);
  }
);`,
      },
      { type: "h2", text: "The signature check" },
      {
        type: "p",
        text: "Because the webhook URL is public, anyone could post fake events to it. Stripe signs every event with a secret that only we and Stripe know. constructEvent recomputes the signature and throws if it doesn't match. If it throws, I answer with a 400 and do nothing else.",
      },
      {
        type: "callout",
        kind: "warning",
        text: "Signature checking needs the raw request body, byte for byte. If express.json() parses the body first, the signature will never match. Register the webhook route with express.raw() before the JSON parser, or it will fail in a confusing way.",
      },
      {
        type: "p",
        text: "This cost me about an hour the first time. The error message just says the signature doesn't match, which makes you doubt your secret before you suspect your middleware order.",
      },
      { type: "h2", text: "What happens after payment" },
      {
        type: "p",
        text: "When a verified checkout.session.completed event arrives, the server marks the payment as paid and moves the rental request forward. A rental that becomes active also flips the property to RESERVED, and when the rental is completed the property goes back to AVAILABLE. All of that happens on the server, with no help from the browser.",
      },
      {
        type: "p",
        text: "Stripe can deliver the same event more than once, so the handler needs to be safe to run twice. Marking an already-paid payment as paid again should change nothing.",
      },
      { type: "h2", text: "So what does the success page do?" },
      {
        type: "p",
        text: "It's just a friendly page. It tells the tenant that we're confirming their payment and shows the real status once the webhook has landed. If the webhook is a few seconds late, the page says so honestly instead of pretending.",
      },
      { type: "h2", text: "Testing it locally" },
      {
        type: "p",
        text: "The Stripe CLI can forward webhook events to your local server, which is the easiest way to test this without deploying anything.",
      },
      {
        type: "code",
        file: "terminal",
        text: `stripe listen --forward-to localhost:5000/webhooks/stripe`,
      },
      {
        type: "p",
        text: "The CLI prints a signing secret for that session. Use it as your STRIPE_WEBHOOK_SECRET while testing, then switch to the real one from the Stripe dashboard in production.",
      },
      { type: "h2", text: "Takeaway" },
      {
        type: "p",
        text: "The browser is the customer's device, so I treat anything that comes from it as a request, not a fact. For payments, the fact comes from Stripe, delivered to my server, with a signature I can verify.",
      },
    ],
  },
];

export const getPost = (slug: string) => posts.find((p) => p.slug === slug);

export const getAdjacent = (slug: string) => {
  const i = posts.findIndex((p) => p.slug === slug);
  return {
    prev: i > 0 ? posts[i - 1] : null,
    next: i >= 0 && i < posts.length - 1 ? posts[i + 1] : null,
  };
};
