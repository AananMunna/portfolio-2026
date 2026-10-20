/**
 * Project data — single source of truth for gallery + detail view.
 * Written to read like real shipped products for recruiters.
 */

export interface Feature {
  title: string;
  desc: string;
}

export interface Challenge {
  challenge: string;
  solution: string;
}

export interface Project {
  id: number;
  title: string;
  category: string;
  image: string;
  year: string;
  description: string;
  link: string;
  github: string;
  tags: string[];

  tagline: string;
  role: string;
  type: string;
  status: 'Live' | 'In progress' | 'Archived';
  overview: string;
  problem: string;
  solution: string;
  features: Feature[];
  challenges?: Challenge[];
}

export const projects: Project[] = [
  {
    id: 1,
    title: 'CourierGo',
    category: 'Logistics Platform',
    image: '/images/courier.png', // add a real screenshot
    year: '2025',
    description:
      'A full courier & logistics platform with customers, riders, and admins — real booking, tracking, bKash payments, and a production-style REST API.',
    link: 'https://couriergo.vercel.app/',
    github: 'https://github.com/AananMunna/Courier-Logistics-Platform-Frontend',
    tags: ['react', 'express', 'mongodb', 'tailwind'], // or extend tags if your UI supports next/typescript/prisma etc.

    tagline: 'Book, assign, deliver, and track parcels — a real multi-role logistics system.',
    role: 'Full-stack Developer',
    type: 'Full-stack logistics platform',
    status: 'Live',

    overview:
      'CourierGo is a complete courier and logistics platform modeled after real services like Pathao Courier, RedX, and Steadfast. Customers book shipments, admins assign verified riders, and riders move parcels through a strict delivery lifecycle — with public tracking, role-based dashboards, and real bKash payment flow. I built both the Next.js frontend and the Node/Express backend as one product system.',

    problem:
      'E-commerce and F-commerce in Bangladesh depend on courier networks to move parcels between sellers and buyers. Building that system is not a simple CRUD app — it needs multi-role access, controlled status transitions, rider onboarding, hub-based routing, payment reconciliation, and public tracking that still stays secure.',

    solution:
      'I designed CourierGo as a production-style platform with three primary roles (Customer, Rider, Admin), a strict shipment state machine, PostgreSQL data models, Redis-backed OTP flows, and a separate REST API consumed by a Next.js App Router frontend. The frontend talks to the backend through first-party API proxying to keep auth cookies reliable and avoid CORS issues.',

    features: [
      {
        title: 'Multi-role product system',
        desc: 'Separate experiences for customers, riders, and admins — each with protected routes, permissions, and workflows.',
      },
      {
        title: 'End-to-end shipment lifecycle',
        desc: 'From booking to delivery: PENDING → ASSIGNED → PICKED_UP → IN_TRANSIT → OUT_FOR_DELIVERY → DELIVERED / FAILED, with immutable tracking events.',
      },
      {
        title: 'Customer booking & payments',
        desc: 'Four-step booking flow, live fee calculation, bKash checkout or cash on delivery, payment history, and cancellation before pickup.',
      },
      {
        title: 'Rider operations',
        desc: 'Rider applications with admin approval, assigned parcel queues, status updates, issue reporting, earnings, and availability controls.',
      },
      {
        title: 'Admin control center',
        desc: 'Dashboard analytics, rider assignment, application review, hub management, user controls, payments, and audit logs.',
      },
      {
        title: 'Public tracking',
        desc: 'Anyone can track a parcel with a tracking code — no login required — backed by a full timeline of status events.',
      },
      {
        title: 'Production backend architecture',
        desc: 'TypeScript, Express, PostgreSQL, Prisma, Redis, Zod validation, JWT auth, transactions, soft deletes, and modular domain services.',
      },
      {
        title: 'Frontend engineering quality',
        desc: 'Next.js App Router, TypeScript, TanStack Query/Form, Zod, shadcn/ui, Recharts, role-aware routing, and resilient API client behavior.',
      },
    ],

    challenges: [
      {
        challenge:
          'Preventing race conditions when two admins try to assign the same parcel at the same time.',
        solution:
          'Used optimistic concurrency with transactional updates that only succeed if the shipment is still in the expected status — otherwise the request fails safely with conflict handling.',
      },
      {
        challenge:
          'Keeping shipment progress realistic and enforceable instead of allowing arbitrary status jumps.',
        solution:
          'Implemented a strict status-transition map so parcels can only move through valid next states, never skip steps or move backwards.',
      },
      {
        challenge:
          'Handling real-world rider onboarding instead of letting anyone immediately accept deliveries.',
        solution:
          'Built a verification flow: riders submit details, verify email, then wait for admin approval before they can receive assignments.',
      },
      {
        challenge:
          'Supporting both bKash and COD without splitting payment logic into messy special cases.',
        solution:
          'Unified both methods through one Payment model so analytics, shipment payment status, and admin views stay consistent.',
      },
      {
        challenge:
          'Avoiding CORS and cookie issues between a separate frontend and backend in production.',
        solution:
          'Proxied API calls through the Next.js app so auth cookies remain first-party, then protected routes using session-aware middleware.',
      },
      {
        challenge:
          'Working around imperfect backend edge cases without breaking the user experience.',
        solution:
          'Handled known API quirks on the client: client-side payment filtering, safer profile updates, normalized tracking codes, and clearer upload error states.',
      },
    ],
  },
  {
    id: 7,
    title: 'RentNest',
    category: 'Rental Marketplace',
    image: '/images/rent.jpg', // Update with your actual screenshot path
    year: '2026',
    description:
      'A full-stack rental property marketplace featuring multi-role dashboards, Stripe checkout, rental request state machine, and a secure Next.js 16 App Router frontend.',
    link: 'https://rentnest-frontend.vercel.app/', // Update with your deployment link
    github: 'https://github.com/AananMunna/RentNest', // Update with your GitHub repo link
    tags: ['next.js', 'react', 'typescript', 'tailwind', 'express', 'postgresql', 'prisma', 'stripe'],

    tagline: 'Find, list, request, and securely pay for rental properties — a complete multi-role real estate marketplace.',
    role: 'Full-stack Developer',
    type: 'Full-stack rental property marketplace',
    status: 'Live',

    overview:
      'RentNest is a comprehensive rental property platform designed to connect tenants, landlords, and administrators. Tenants browse property catalogs with granular filters, submit rental requests, and complete online transactions through Stripe. Landlords manage properties and incoming lease requests, while admins oversee marketplace health. The system utilizes a decoupled architecture featuring a Next.js 16 App Router frontend paired with a production-ready Express 5 and PostgreSQL backend using Prisma ORM.',

    problem:
      'Traditional rental listing boards are often static directories that lack end-to-end transaction capabilities, role-specific workflows, and structured lifecycle tracking for lease requests. Building a robust property marketplace requires complex multi-role access control, secure cookie-based authentication, automated property status synchronization, and integrated payment gateways.',

    solution:
      'I engineered RentNest as a full-stack product system incorporating a secure Next.js frontend-for-backend layer communicating with an Express REST API. The backend implements strict modular layering (routes, controllers, services) backed by PostgreSQL. I built a bulletproof rental lifecycle state machine, integrated Stripe Checkout with webhook event verification, and configured HTTP-only secure cookie authentication to handle multi-tenant sessions smoothly.',

    features: [
      {
        title: 'Multi-role marketplace system',
        desc: 'Dedicated role-specific dashboards and protected experiences for Tenants, Landlords, and Admins.',
      },
      {
        title: 'Advanced property catalog & filtering',
        desc: 'Public browsing with dynamic query filters for search terms, categories, cities, price ranges, and sorting options.',
      },
      {
        title: 'Rigorous rental request lifecycle',
        desc: 'State-driven progression: PENDING → APPROVED → (payment) → ACTIVE → COMPLETED, with automatic property availability synchronization.',
      },
      {
        title: 'Stripe payments & webhooks',
        desc: 'Secure checkout sessions for approved rental requests backed by cryptographically verified Stripe webhook event handlers.',
      },
      {
        title: 'Landlord & admin oversight',
        desc: 'Landlords can list properties and manage incoming requests, while admins can moderate users, categories, and marketplace listings.',
      },
      {
        title: 'Post-completion reviews',
        desc: 'Verified tenants can leave authentic ratings and reviews on properties after a rental request reaches completion.',
      },
      {
        title: 'Next.js 16 App Router & server actions',
        desc: 'Modern frontend architecture utilizing Server Components, Server Actions, Zod validation, and Radix UI primitives.',
      },
      {
        title: 'Production-grade backend architecture',
        desc: 'Node.js (ESM), Express 5, PostgreSQL via Prisma ORM, JWT authentication with refresh tokens, and centralized error handling.',
      },
    ],

    challenges: [
      {
        challenge:
          'Keeping property availability strictly synchronized with active and approved rental request states.',
        solution:
          'Implemented automated status hooks where properties automatically toggle to RESERVED during active agreements and revert to AVAILABLE once completed.',
      },
      {
        challenge:
          'Securing payment reconciliation and handling asynchronous transaction verification safely.',
        solution:
          'Integrated Stripe Checkout alongside raw-body signature-verified webhook endpoints to process payment events securely without relying solely on client callbacks.',
      },
      {
        challenge:
          'Preventing CORS and session synchronization issues between the separate Next.js client and Express backend.',
        solution:
          'Established a server-side API proxy layer and managed access tokens via HTTP-only secure cookies within the Next.js domain.',
      },
      {
        challenge:
          'Enforcing strict role-based access control across complex API modules and route hierarchies.',
        solution:
          'Created modular authentication and authorization middleware paired with Next.js middleware matchers to protect sensitive dashboard routes effectively.',
      },
    ],
  },
  {
    id: 2,
    title: 'TripTale',
    category: 'Travel Platform',
    image: '/images/triptale.png',
    year: '2024',
    description:
      'A full-stack travel community for story-first trip sharing — auth, maps, feeds, and a complete REST API, built and shipped solo.',
    link: 'https://peppy-youtiao-479900.netlify.app/',
    github: 'https://github.com/AananMunna/trip-tale-client',
    tags: ['react', 'express', 'mongodb', 'tailwind'],

    tagline: 'A travel community where the story matters more than the photo.',
    role: 'Full-stack Developer',
    type: 'Full-stack web application',
    status: 'Live',

    overview:
      'TripTale is a story-first travel platform where people publish real journeys — places, context, and narrative — instead of only photo grids. I designed and built the full product: authentication, REST API, database models, feed, and map-linked stories, then shipped it as a working application.',

    problem:
      'Most travel platforms optimise for images. The actual experience — where someone went, what happened, what they would tell a friend — gets lost. Travelers had no focused place to publish structured trip stories with location context and community interaction.',

    solution:
      'I built a dedicated product around trip narratives. Users create accounts, publish stories tied to real places, browse a community feed, and interact with other travelers. The backend is a structured Express + MongoDB API; the frontend is a React app with protected routes and a clean reading experience.',

    features: [
      {
        title: 'Authentication & protected routes',
        desc: 'Sign up, login, and session-aware routing so every story is owned by a real user.',
      },
      {
        title: 'Story-first publishing',
        desc: 'Trips are written as narratives with supporting media — not just image dumps.',
      },
      {
        title: 'Maps & place context',
        desc: 'Stories link to real locations so readers understand where things happened.',
      },
      {
        title: 'Community feed',
        desc: 'Browse, discover, and engage with journeys from other travelers.',
      },
      {
        title: 'REST API + MongoDB',
        desc: 'Custom Express API handling users, stories, and community data with a clear resource model.',
      },
      {
        title: 'Responsive product UI',
        desc: 'Reading and publishing flows designed to work cleanly on phone, tablet, and desktop.',
      },
    ],

    challenges: [
      {
        challenge:
          'Keeping auth, API contracts, and UI state consistent while building alone across the full stack.',
        solution:
          'Separated client and server clearly, protected routes on both sides, and kept API responses predictable so the UI never depended on hidden assumptions.',
      },
      {
        challenge:
          'Content-heavy story pages risked feeling slow and heavy.',
        solution:
          'Optimised image handling, kept components focused, and prioritised fast first render on feed and story views.',
      },
      {
        challenge:
          'Designing a data model that could grow from simple posts into place-linked stories.',
        solution:
          'Modeled users, stories, and locations as separate concerns early so the API stayed flexible as features expanded.',
      },
    ],
  },

  {
    id: 3,
    title: 'StudySync',
    category: 'EdTech Platform',
    image: '/images/studys.png',
    year: '2024',
    description:
      'A full-stack platform that turns messy group assignments into structured, trackable, gamified teamwork with leaderboards and clear ownership.',
    link: 'https://studysync-d270a.web.app/',
    github: 'https://github.com/AananMunna/studySync',
    tags: ['react', 'tailwind', 'express', 'mongodb'],

    tagline: 'Group assignments, finally organised — and a little competitive.',
    role: 'Full-stack Developer',
    type: 'Full-stack web application',
    status: 'Live',

    overview:
      'StudySync helps students manage group assignments with structure instead of chaos. It combines assignment ownership, progress tracking, and lightweight gamification so contribution is visible and motivation stays higher. I built the product end to end — UI, API, auth, and scoring logic.',

    problem:
      'Group work usually lives in scattered chats, random files, and last-minute panic. Nobody is sure who owns what, progress is invisible, and consistent contribution is hard to measure or encourage.',

    solution:
      'I created a single workspace for group assignments: clear ownership, trackable progress, and leaderboards that make steady work visible. The system runs on an Express + MongoDB backend with authenticated users and a React frontend focused on clarity and speed.',

    features: [
      {
        title: 'Assignment management',
        desc: 'Create, assign, and track group work from one structured board instead of scattered chats.',
      },
      {
        title: 'Ownership & progress',
        desc: 'Each task has clear responsibility and status, so teams always know what is moving.',
      },
      {
        title: 'Gamified contribution',
        desc: 'Points and progress make consistent work visible without turning the product into a gimmick.',
      },
      {
        title: 'Leaderboards',
        desc: 'Transparent rankings that reward steady participation and create healthy accountability.',
      },
      {
        title: 'Authenticated accounts',
        desc: 'Personal accounts so contribution, scores, and assignment history stay accurate.',
      },
      {
        title: 'API-driven architecture',
        desc: 'Express and MongoDB power users, assignments, and scoring with a clean data flow.',
      },
    ],

    challenges: [
      {
        challenge:
          'Designing a scoring system that felt motivating without feeling unfair or easy to game.',
        solution:
          'Kept the rules simple, transparent, and tied to meaningful actions so rankings were easy to trust.',
      },
      {
        challenge:
          'Balancing feature depth with a UI students would actually understand quickly.',
        solution:
          'Prioritised a clear information hierarchy and removed friction from the most common flows: create, assign, update, check progress.',
      },
    ],
  },

  {
    id: 4,
    title: 'Garden',
    category: 'Community Platform',
    image: '/images/garden.png',
    year: '2024',
    description:
      'A gardening community product with profile-style gardener highlights, motion-rich browsing, and a full backend for dynamic content.',
    link: 'https://gardening-hub-a68ec.web.app/',
    github: 'https://github.com/AananMunna/gardening-hub',
    tags: ['tailwind', 'react', 'mongodb', 'express'],

    tagline: 'A gardening community that feels like people, not a catalogue.',
    role: 'Full-stack Developer',
    type: 'Full-stack web application',
    status: 'Live',

    overview:
      'Garden is a community-oriented gardening platform focused on people and discovery. Instead of a static catalogue, it highlights gardeners through profile-style presentation, supported by smooth browsing interactions and a backend for dynamic content.',

    problem:
      'Many gardening sites feel like static product pages. Enthusiasts want to discover real people, real gardens, and a sense of community — not only lists of plants or tips with no personality.',

    solution:
      'I built a visually rich community hub where gardeners are presented like profiles, content is browsable through smooth sliders, and motion adds life without hurting performance. Dynamic data is handled through an Express + MongoDB backend.',

    features: [
      {
        title: 'Featured Gardener profiles',
        desc: 'Profile-style cards that put real people and their gardens at the center of the experience.',
      },
      {
        title: 'Discovery-focused browsing',
        desc: 'Swiper-based sections that make exploring content feel fluid on both mobile and desktop.',
      },
      {
        title: 'Motion with restraint',
        desc: 'Lottie and interaction details used to add personality without making pages feel heavy.',
      },
      {
        title: 'Dynamic backend',
        desc: 'Express and MongoDB support community content that can change without rebuilding the UI.',
      },
      {
        title: 'Responsive layout system',
        desc: 'Mobile-first Tailwind interface that stays clean across screen sizes.',
      },
    ],

    challenges: [
      {
        challenge:
          'Adding motion and visual richness without hurting load time or making the UI feel noisy.',
        solution:
          'Used lightweight animation approaches and kept motion purposeful — supporting hierarchy, not decorating every section.',
      },
      {
        challenge:
          'Making a community product feel human while still remaining structured and scalable.',
        solution:
          'Centered the UI around people and profiles first, then layered content discovery around that core idea.',
      },
    ],
  },

  {
    id: 5,
    title: 'Othoba',
    category: 'E-Commerce UI',
    image: '/images/othoba.png',
    year: '2024',
    description:
      'A high-fidelity frontend reconstruction of a real Bangladeshi e-commerce experience — built to match production-level UI density and polish.',
    link: 'https://clone-othoba.vercel.app/',
    github: 'https://github.com/AananMunna/othoba.com',
    tags: ['react', 'tailwind'],

    tagline: 'A production-level e-commerce interface rebuilt with precision.',
    role: 'Frontend Developer',
    type: 'Frontend product reconstruction',
    status: 'Live',

    overview:
      'Othoba is a deliberate frontend reconstruction of a real Bangladeshi e-commerce interface. The goal was not a quick lookalike — it was to prove I can read a dense production UI and rebuild its structure, spacing, hierarchy, and component behavior with accuracy.',

    problem:
      'Most portfolio projects avoid real commercial UI complexity: crowded navigation, repeated product modules, mixed content density, and strict visual consistency. That gap makes it hard to show production frontend discipline.',

    solution:
      'I rebuilt the interface from scratch in React and Tailwind with a component-driven structure. The focus was fidelity — layout systems, reusable cards, navigation patterns, and responsive behavior that hold up against a real retail site.',

    features: [
      {
        title: 'High-fidelity layout system',
        desc: 'Spacing, type scale, and section structure matched to the density of a real e-commerce storefront.',
      },
      {
        title: 'Reusable commercial components',
        desc: 'Product cards, banners, navigation blocks, and content sections built as consistent UI units.',
      },
      {
        title: 'Responsive storefront behavior',
        desc: 'Careful adaptation from mobile to wide desktop without breaking hierarchy or scanability.',
      },
      {
        title: 'Production UI discipline',
        desc: 'Treated visual polish and consistency as product requirements, not optional styling.',
      },
    ],

    challenges: [
      {
        challenge:
          'Reproducing a dense retail interface without letting the codebase become messy.',
        solution:
          'Broke the page into reusable components early and standardised spacing and card patterns across sections.',
      },
      {
        challenge:
          'Keeping the rebuild responsive while preserving the original visual weight of the desktop experience.',
        solution:
          'Designed mobile adaptations around hierarchy first — what users need to scan — instead of simply shrinking desktop layouts.',
      },
    ],
  },

  {
    id: 6,
    title: 'ValoDeal',
    category: 'E-Commerce Deals',
    image: '/images/valodeal.png',
    year: '2024',
    description:
      'A deal-focused shopping product with fast filtering, in-place product inspection, and motion designed to feel smooth rather than decorative.',
    link: 'https://valo-deal.vercel.app/',
    github: 'https://github.com/AananMunna/ValoDeal',
    tags: ['react', 'tailwind'],

    tagline: 'Discount discovery with a fast, low-friction shopping flow.',
    role: 'Frontend Developer',
    type: 'E-commerce web application',
    status: 'Live',

    overview:
      'ValoDeal is a deal-driven shopping experience built for quick comparison and low-friction product inspection. Shoppers can filter offers, open details without losing context, and move through the catalogue with smooth, restrained motion.',

    problem:
      'Deal platforms often fail in the details: slow browsing, weak filtering, and product views that break the user’s flow. When comparison is the job to be done, friction means missed decisions.',

    solution:
      'I focused on browsing speed and continuity — filterable listings, detail modals that preserve context, and transitions that make the interface feel responsive without becoming a distraction.',

    features: [
      {
        title: 'Fast product filtering',
        desc: 'Helps users narrow deals quickly instead of scrolling through noise.',
      },
      {
        title: 'In-place detail modals',
        desc: 'Inspect a product without leaving the listing or losing scroll position.',
      },
      {
        title: 'Motion for clarity',
        desc: 'Framer Motion transitions used to support flow and feedback, not decoration.',
      },
      {
        title: 'Responsive shopping UI',
        desc: 'A catalogue experience that stays usable and clean from mobile to desktop.',
      },
    ],

    challenges: [
      {
        challenge:
          'Making filtering and detail views feel instant while keeping the interface simple.',
        solution:
          'Kept state local to the catalogue flow and avoided full-page navigations for product inspection.',
      },
      {
        challenge:
          'Using animation in an e-commerce context without making it feel gimmicky.',
        solution:
          'Limited motion to meaningful transitions — opening details, switching context, and soft feedback on interaction.',
      },
    ],
  },
];