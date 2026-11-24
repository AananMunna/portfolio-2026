/**
 * Blog posts. These are original write-ups of problems I actually hit while
 * building CourierGo and RentNest. Edit freely — it's your voice, not mine.
 *
 * Each block is either a paragraph, a heading, or a code snippet.
 */

export type Block =
  | { type: "p"; text: string }
  | { type: "h"; text: string }
  | { type: "code"; text: string };

export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  tags: string[];
  excerpt: string;
  content: Block[];
}

export const posts: BlogPost[] = [
  {
    slug: "two-admins-one-parcel",
    title: "Two admins, one parcel: stopping double assignments in CourierGo",
    date: "Nov 24, 2026",
    tags: ["Backend", "PostgreSQL", "Prisma"],
    excerpt:
      "What happens when two admins click “assign rider” on the same parcel at the same second, and the small fix that stops it.",
    content: [
      {
        type: "p",
        text: "In CourierGo, an admin assigns a rider to a pending parcel. It looks like a simple update: set the rider, change the status to ASSIGNED. It works fine when you test it alone. The problem shows up when two admins have the same parcel open and both click assign within a second of each other.",
      },
      { type: "h", text: "The naive version" },
      {
        type: "p",
        text: "My first version read the parcel, checked that it was PENDING, then wrote the new rider. Between the read and the write there is a gap. If both requests read PENDING inside that gap, both pass the check, and the second write silently overwrites the first. One rider gets told they have a parcel, and then it disappears.",
      },
      { type: "h", text: "The fix" },
      {
        type: "p",
        text: "Instead of checking first and writing later, I put the check inside the write itself. The update only matches the row if the parcel is still PENDING. Whoever gets there second matches zero rows.",
      },
      {
        type: "code",
        text: `// simplified
const result = await prisma.shipment.updateMany({
  where: { id: shipmentId, status: "PENDING" },
  data: { riderId, status: "ASSIGNED" },
});

if (result.count === 0) {
  throw new ConflictError("This parcel was already assigned");
}`,
      },
      {
        type: "p",
        text: "The database handles the race, not my code. The losing admin gets a clear conflict message and refreshes to see who got it. No locks, no extra tables.",
      },
      { type: "h", text: "What I took from it" },
      {
        type: "p",
        text: "Any time I write “read, check, then write”, I now stop and ask what happens if two people do this at once. Most of the time the answer is a where clause that carries the expected state.",
      },
    ],
  },
  {
    slug: "parcels-cant-skip-steps",
    title: "Why parcels in CourierGo can’t skip steps",
    date: "Nov 24, 2026",
    tags: ["Backend", "System design"],
    excerpt:
      "A small transition map that keeps delivery statuses honest, so nothing jumps from PENDING straight to DELIVERED.",
    content: [
      {
        type: "p",
        text: "A parcel in CourierGo moves through PENDING, ASSIGNED, PICKED_UP, IN_TRANSIT, OUT_FOR_DELIVERY and finally DELIVERED or FAILED. Early on, my API accepted any status as long as it was a valid value. That meant a bug in the rider app, or a hand-crafted request, could mark an unassigned parcel as delivered.",
      },
      { type: "h", text: "One object that says what’s allowed" },
      {
        type: "p",
        text: "I replaced the loose check with a map of each status and the statuses it is allowed to move to next. Every status update goes through it.",
      },
      {
        type: "code",
        text: `const NEXT: Record<Status, Status[]> = {
  PENDING: ["ASSIGNED"],
  ASSIGNED: ["PICKED_UP"],
  PICKED_UP: ["IN_TRANSIT"],
  IN_TRANSIT: ["OUT_FOR_DELIVERY"],
  OUT_FOR_DELIVERY: ["DELIVERED", "FAILED"],
  DELIVERED: [],
  FAILED: [],
};

function canMove(from: Status, to: Status) {
  return NEXT[from].includes(to);
}`,
      },
      {
        type: "p",
        text: "If canMove returns false, the request is rejected. Parcels can’t skip a step and can’t go backwards.",
      },
      { type: "h", text: "Tracking events stay as they are" },
      {
        type: "p",
        text: "Each change also adds a tracking event, and I never edit old ones. That gives the public tracking page a real timeline, and it gives me something to look at when a customer says “my parcel was marked delivered but I never got it”.",
      },
      {
        type: "p",
        text: "It is a very small piece of code, but it moved a whole class of bugs from “possible” to “not possible”, which is the kind of change I like most.",
      },
    ],
  },
  {
    slug: "dont-trust-the-stripe-redirect",
    title: "Don’t trust the Stripe redirect: handling payments in RentNest",
    date: "Nov 24, 2026",
    tags: ["Stripe", "Next.js", "Express"],
    excerpt:
      "Why RentNest confirms payments through a signed webhook instead of the page the user lands on after checkout.",
    content: [
      {
        type: "p",
        text: "When a tenant pays for a rental in RentNest, Stripe Checkout sends them back to a success page on our site. It is tempting to mark the payment as done right there. I did that at first, and then I thought about what actually reaches that page.",
      },
      { type: "h", text: "The redirect isn’t proof" },
      {
        type: "p",
        text: "Anyone can open the success URL by hand. And a real customer can pay and then close the tab before the redirect happens. In the first case you record a payment that never happened. In the second you miss one that did.",
      },
      { type: "h", text: "Let Stripe tell the server" },
      {
        type: "p",
        text: "RentNest now treats the webhook as the source of truth. Stripe calls an endpoint on the Express server when the checkout session completes. The server checks the signature, and only then marks the payment as paid and moves the rental request forward.",
      },
      {
        type: "code",
        text: `// simplified
app.post(
  "/webhooks/stripe",
  express.raw({ type: "application/json" }),
  (req, res) => {
    const event = stripe.webhooks.constructEvent(
      req.body,
      req.headers["stripe-signature"],
      process.env.STRIPE_WEBHOOK_SECRET
    );

    if (event.type === "checkout.session.completed") {
      // mark payment as paid, update the rental request
    }
    res.sendStatus(200);
  }
);`,
      },
      {
        type: "p",
        text: "One detail cost me an hour: signature checking needs the raw request body. If a JSON parser runs first, the signature never matches, so the webhook route has to be registered before express.json().",
      },
      {
        type: "p",
        text: "The success page is now just a friendly message. It shows the real status once the webhook has landed.",
      },
    ],
  },
];

export const getPost = (slug: string) => posts.find((p) => p.slug === slug);
