/** Project data — single source of truth for gallery + detail view. */

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
  /** Frontend repo (or the only repo, for single-repo projects). */
  github: string;
  /** Backend repo, when it lives in a separate repository. */
  githubBackend?: string;
  /** Whether this came from a job/client (company) or is my own project (personal). */
  workType: 'company' | 'personal';
  /** Shown instead of a Live button when there is no public link. */
  liveNote?: string;
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
    id: 8,
    title: 'Eqrah',
    category: 'EdTech SaaS',
    workType: 'company',
    image: '/images/eqrah.webp',
    year: '2025–2026',
    description:
      'A multi-tenant school management SaaS. I built most of the frontend (students, fee collection, documents, ID cards and every certificate type) and added some REST APIs on the Node/Express backend.',
    link: '', // no public live link
    github: '', // private
    githubBackend: '', // private
    liveNote:
      'No public live link. This is a company project, and company policy doesn’t allow sharing it publicly.',
    tags: ['next.js', 'react', 'redux', 'typescript', 'node.js', 'express', 'mongodb', 'ant design'],

    tagline: 'Complete educational management system for schools.',
    role: 'Front-end Developer + some backend APIs',
    type: 'Multi-tenant EdTech SaaS',
    status: 'Live',

    overview:
      'Eqrah is a multi-tenant school management system used by real schools. It covers students, teachers, exams, attendance, fees, certificates, ID cards, HR, hostel and finance. At Al Jaami I owned a large part of the frontend (students, fee collection, documents, ID cards and all the certificate types) and also wrote and maintained some of the REST APIs.',

    problem:
      'A lot of schools in Bangladesh still run on spreadsheets, paper and a few tools that don’t talk to each other. Handling students, fees, exams, attendance and certificates across several institutions needs a secure multi-tenant system with proper roles.',

    solution:
      'Eqrah is a multi-tenant SaaS where each school’s data is isolated, roles control access, and the modules follow how schools actually work. My part was the React/Next.js frontend for the most-used screens and some of the Express and MongoDB APIs behind them. It was a team project.',

    features: [
      {
        title: 'Students',
        desc: 'Enrolment, profiles, search, promotion and documents.',
      },
      {
        title: 'Fee collection',
        desc: 'Fee heads, collection, dues, late fines, receipts and daily reports.',
      },
      {
        title: 'ID cards and certificates',
        desc: 'Student ID cards with QR, admit cards, transfer certificates, experience letters and testimonials, with bulk generation.',
      },
      {
        title: 'Exams and results',
        desc: 'Mark entry, tabulation, publishing results, hall tickets and performance reports.',
      },
      {
        title: 'Attendance',
        desc: 'Daily and exam attendance, leave management and reports.',
      },
      {
        title: 'Multi-tenant setup',
        desc: 'A central database plus tenant databases, with tenant-aware APIs so schools stay isolated.',
      },
      {
        title: 'Admin dashboard',
        desc: 'KPIs, attendance ring, income and expense, account charts, calendar and notice board.',
      },
    ],

    challenges: [
      {
        challenge: 'Dense screens that non-technical school staff can actually use.',
        solution:
          'Fee collection, mark entry and certificates have a lot of fields. I kept a clear hierarchy, used the same form patterns everywhere and hid secondary options until needed, so common tasks stay short.',
      },
      {
        challenge: 'Keeping frontend state and the tenant APIs in sync across many modules.',
        solution:
          'Redux Toolkit with RTK Query, careful cache invalidation, and the tenant header sent on every request.',
      },
      {
        challenge: 'Print-ready ID cards and certificates with QR codes.',
        solution:
          'I built separate print layouts and generation flows, with QR support and batch printing.',
      },
    ],
  },
  {
    id: 9,
    title: 'Mohidul',
    category: 'Client Portfolio',
    workType: 'company',
    image: '/images/mohidul.webp',
    year: '2025',
    description:
      'Personal portfolio for a professional UI/UX designer. Built from scratch with Next.js so he can showcase his work and grow his design business.',
    link: 'https://www.mohidul.me/',
    github: '', // client project, private
    githubBackend: '',
    tags: ['next.js', 'react', 'typescript', 'tailwind', 'framer motion'],

    tagline: 'Clean portfolio for a UI/UX designer running his own practice.',
    role: 'Front-end Developer',
    type: 'Client portfolio website',
    status: 'Live',

    overview:
      'Mohidul is a portfolio site for a UI/UX designer who came to Al Jaami Technologies to get his work online and support his design business. I built it in Next.js to show his work clearly, tell the story of each project and load fast.',

    problem:
      'He was starting his own practice, so a generic template wasn’t going to work. The site had to be as polished as his design work, load fast, look good on every device and make it easy for a client to see what he does and get in touch.',

    solution:
      'I built a custom Next.js portfolio with a clear visual hierarchy, light motion and structured case study pages. I kept the design and animation restrained so his work is what people look at.',

    features: [
      {
        title: 'Case study pages',
        desc: 'Each project has its own page showing the process, the decisions and the result.',
      },
      {
        title: 'Clear hierarchy',
        desc: 'Type, spacing and layout kept simple and consistent.',
      },
      {
        title: 'Light motion',
        desc: 'Small Framer Motion transitions that support the content.',
      },
      {
        title: 'Responsive',
        desc: 'Works from mobile to large desktop screens.',
      },
      {
        title: 'Fast',
        desc: 'Next.js App Router with optimised images.',
      },
      {
        title: 'Easy to contact',
        desc: 'Clear calls to action so potential clients can reach him quickly.',
      },
    ],

    challenges: [
      {
        challenge: 'Meeting a professional designer’s own standards.',
        solution:
          'I kept the interface minimal and precise: strong hierarchy, consistent spacing and nothing decorative. His work stays the focus.',
      },
      {
        challenge: 'Case studies that are easy to read.',
        solution:
          'Every project page follows the same order (problem, process, outcome) with restrained motion.',
      },
    ],
  },
  {
    id: 1,
    title: 'CourierGo',
    category: 'Logistics Platform',
    workType: 'personal',
    image: '/images/courier.png',
    year: '2025',
    description:
      'A courier platform I built end to end. Customers book parcels, admins assign riders, riders update delivery status, and anyone can track a parcel with a code. Payments through bKash.',
    link: 'https://couriergo.vercel.app/',
    github: 'https://github.com/AananMunna/Courier-Logistics-Platform-Frontend',
    githubBackend: '', // TODO: add the backend repo URL
    tags: ['next.js', 'typescript', 'tailwind', 'express', 'postgresql', 'prisma', 'redis'],

    tagline: 'Book a parcel, assign a rider, track it to the door.',
    role: 'Full-stack Developer',
    type: 'Full-stack logistics platform',
    status: 'Live',

    overview:
      'CourierGo is a courier and logistics app modelled on services like Pathao Courier, RedX and Steadfast. A customer books a parcel, an admin assigns a rider, and the rider moves it through each delivery stage. There are separate dashboards for each role, public tracking and a bKash payment flow. I built both the Next.js frontend and the Node/Express backend myself.',

    problem:
      'A lot of online selling in Bangladesh depends on couriers to get parcels from sellers to buyers. A system like that is more than CRUD. It needs different roles, parcels that can only move through valid statuses, rider onboarding, hub routing, payment records that add up, and tracking that anyone can use without exposing private data.',

    solution:
      'There are three roles: Customer, Rider and Admin. Parcels follow a fixed status flow. Data lives in PostgreSQL, OTPs go through Redis, and a separate REST API serves the Next.js frontend. The frontend calls that API through a Next.js proxy, so auth cookies stay first-party and I don’t have to fight CORS.',

    features: [
      {
        title: 'Three roles, three dashboards',
        desc: 'Customers, riders and admins each get their own protected pages and permissions.',
      },
      {
        title: 'Delivery lifecycle',
        desc: 'PENDING → ASSIGNED → PICKED_UP → IN_TRANSIT → OUT_FOR_DELIVERY → DELIVERED or FAILED. Every change is saved as a tracking event that can’t be edited later.',
      },
      {
        title: 'Booking and payment',
        desc: 'A four-step booking form with live fee calculation. Pay with bKash or cash on delivery, see payment history, cancel before pickup.',
      },
      {
        title: 'Rider side',
        desc: 'Riders apply and wait for admin approval. After that they see their assigned parcels, update status, report problems and check earnings.',
      },
      {
        title: 'Admin panel',
        desc: 'Analytics, rider assignment, application review, hubs, users, payments and audit logs.',
      },
      {
        title: 'Public tracking',
        desc: 'Enter a tracking code and see the full timeline. No login needed.',
      },
      {
        title: 'Backend',
        desc: 'TypeScript, Express, PostgreSQL with Prisma, Redis, Zod validation, JWT auth, transactions and soft deletes.',
      },
      {
        title: 'Frontend',
        desc: 'Next.js App Router, TanStack Query and Form, Zod, shadcn/ui and Recharts, with routes that change by role.',
      },
    ],

    challenges: [
      {
        challenge: 'Two admins assigning the same parcel at the same moment.',
        solution:
          'I made the update conditional on the parcel still being in the expected status, inside a transaction. If someone else got there first, the request fails with a conflict instead of overwriting.',
      },
      {
        challenge: 'Stopping parcels from jumping to random statuses.',
        solution:
          'A transition map decides which status can follow which. A parcel can’t skip a step or go backwards.',
      },
      {
        challenge: 'Rider onboarding. Not everyone should be able to accept deliveries.',
        solution:
          'A rider applies, verifies their email, and then waits for an admin to approve them before getting any assignments.',
      },
      {
        challenge: 'Supporting bKash and cash on delivery without two separate code paths.',
        solution:
          'Both go through one Payment model, so analytics, parcel payment status and the admin views all read from the same place.',
      },
      {
        challenge: 'CORS and cookie problems between a separate frontend and backend.',
        solution:
          'API calls go through the Next.js app, so the auth cookie stays first-party. Session-aware middleware protects the routes.',
      },
      {
        challenge: 'A few backend quirks I had to live with.',
        solution:
          'I handled them on the client: filtering payments there, safer profile updates, normalising tracking codes and clearer upload errors.',
      },
    ],
  },
  {
    id: 7,
    title: 'RentNest',
    category: 'Rental Marketplace',
    workType: 'personal',
    image: '/images/rent.jpg',
    year: '2026',
    description:
      'A rental marketplace where landlords list properties and tenants send requests and pay through Stripe. Next.js 16 frontend, Express and Prisma backend.',
    link: 'https://rentnest-frontend.vercel.app/',
    github: 'https://github.com/AananMunna/RentNest',
    githubBackend: '', // TODO: add the backend repo URL
    tags: ['next.js', 'react', 'typescript', 'tailwind', 'express', 'postgresql', 'prisma', 'stripe'],

    tagline: 'Find a place, request it, pay for it.',
    role: 'Full-stack Developer',
    type: 'Full-stack rental property marketplace',
    status: 'Live',

    overview:
      'RentNest connects tenants, landlords and admins. Tenants browse listings with filters, send a rental request and pay through Stripe. Landlords list properties and handle the requests. Admins keep an eye on the marketplace. The frontend is Next.js 16 with the App Router, and the backend is Express 5 with PostgreSQL and Prisma.',

    problem:
      'Most rental sites are just listings. There is no payment, no proper flow for a request, and no way to tell what stage a lease is at. Doing it properly means separate roles, cookie-based auth, property status that updates on its own, and a payment gateway.',

    solution:
      'I built a Next.js frontend that talks to an Express REST API (routes, controllers, services, PostgreSQL). A rental request moves through a fixed lifecycle, payments go through Stripe Checkout with webhook verification, and auth uses HTTP-only cookies.',

    features: [
      {
        title: 'Three roles',
        desc: 'Tenants, landlords and admins each have their own dashboard and protected pages.',
      },
      {
        title: 'Search and filters',
        desc: 'Public browsing with search, category, city, price range and sorting.',
      },
      {
        title: 'Request lifecycle',
        desc: 'PENDING → APPROVED → (payment) → ACTIVE → COMPLETED. The property’s availability updates along with it.',
      },
      {
        title: 'Stripe payments',
        desc: 'Checkout sessions for approved requests, with webhook signature verification.',
      },
      {
        title: 'Landlord and admin tools',
        desc: 'Landlords list properties and handle requests. Admins manage users, categories and listings.',
      },
      {
        title: 'Reviews',
        desc: 'A tenant can review a property only after their rental is completed.',
      },
      {
        title: 'Next.js 16',
        desc: 'App Router, Server Components and Actions, Zod validation and Radix UI.',
      },
      {
        title: 'Backend',
        desc: 'Node (ESM), Express 5, PostgreSQL with Prisma, JWT with refresh tokens and centralised error handling.',
      },
    ],

    challenges: [
      {
        challenge: 'Keeping property availability in sync with request status.',
        solution:
          'A property switches to RESERVED while an agreement is active and goes back to AVAILABLE once it’s completed. This runs inside the status-change logic, so it can’t be forgotten.',
      },
      {
        challenge: 'Trusting a payment without relying on the browser.',
        solution:
          'Stripe sends webhooks to a raw-body endpoint. I verify the signature first and only then update the payment.',
      },
      {
        challenge: 'CORS and sessions between the Next.js app and the Express API.',
        solution:
          'Requests go through a server-side proxy, and the access token sits in an HTTP-only cookie on the Next.js domain.',
      },
      {
        challenge: 'Role-based access across many routes.',
        solution:
          'Auth and role middleware on the API, plus Next.js middleware matchers on the dashboard routes.',
      },
    ],
  },

  //{
  //  id: 2,
  //  title: 'TripTale',
  //  category: 'Travel Platform',
  //  workType: 'personal',
  //  image: '/images/triptale.png',
  //  year: '2024',
  //  description:
  //    'A full-stack travel community where people share trips as stories. Auth, maps, a feed and a REST API, all built by me.',
  //  link: 'https://peppy-youtiao-479900.netlify.app/',
  //  github: 'https://github.com/AananMunna/trip-tale-client',
  //  githubBackend: '', // TODO: add the server repo URL
  //  tags: ['react', 'express', 'mongodb', 'tailwind'],
  //
  //  tagline: 'A travel community where the story matters more than the photo.',
  //  role: 'Full-stack Developer',
  //  type: 'Full-stack web application',
  //  status: 'Live',
  //
  //  overview:
  //    'TripTale is a travel site where people write about their trips instead of only posting photos. I built all of it: login, REST API, database models, the feed, and stories linked to places on a map.',
  //
  //  problem:
  //    'Most travel platforms are about pictures. Where you went, what happened and what you’d tell a friend gets lost. I wanted a place where a trip is written as a story with a location attached.',
  //
  //  solution:
  //    'Users sign up, publish stories tied to real places, browse a community feed and interact with other travellers. The backend is an Express and MongoDB API, and the frontend is a React app with protected routes.',
  //
  //  features: [
  //    {
  //      title: 'Login and protected routes',
  //      desc: 'Sign up, log in, and every story belongs to a real user.',
  //    },
  //    {
  //      title: 'Stories, not just photos',
  //      desc: 'A trip is written as a narrative, with media alongside it.',
  //    },
  //    {
  //      title: 'Maps',
  //      desc: 'Stories link to real places, so readers can see where it happened.',
  //    },
  //    {
  //      title: 'Community feed',
  //      desc: 'Browse and react to other travellers’ trips.',
  //    },
  //    {
  //      title: 'REST API',
  //      desc: 'Express and MongoDB handling users, stories and community data.',
  //    },
  //    {
  //      title: 'Responsive',
  //      desc: 'Reading and publishing work on phone, tablet and desktop.',
  //    },
  //  ],
  //
  //  challenges: [
  //    {
  //      challenge: 'Keeping auth, API and UI consistent while working alone on the whole stack.',
  //      solution:
  //        'I kept client and server clearly separate, protected routes on both sides, and kept API responses predictable.',
  //    },
  //    {
  //      challenge: 'Story pages getting heavy.',
  //      solution:
  //        'I optimised images, kept components small and focused on a fast first render for the feed and story pages.',
  //    },
  //    {
  //      challenge: 'A data model that could grow.',
  //      solution:
  //        'Users, stories and locations were separate from the start, so adding features didn’t mean reworking the API.',
  //    },
  //  ],
  //},

  // {
  //   id: 3,
  //   title: 'StudySync',
  //   category: 'EdTech Platform',
  //   image: '/images/studys.png',
  //   year: '2024',
  //   description:
  //     'A full-stack platform that turns messy group assignments into structured, trackable, gamified teamwork with leaderboards and clear ownership.',
  //   link: 'https://studysync-d270a.web.app/',
  //   github: 'https://github.com/AananMunna/studySync',
  //   tags: ['react', 'tailwind', 'express', 'mongodb'],

  //   tagline: 'Group assignments, finally organised — and a little competitive.',
  //   role: 'Full-stack Developer',
  //   type: 'Full-stack web application',
  //   status: 'Live',

  //   overview:
  //     'StudySync helps students manage group assignments with structure instead of chaos. It combines assignment ownership, progress tracking, and lightweight gamification so contribution is visible and motivation stays higher. I built the product end to end — UI, API, auth, and scoring logic.',

  //   problem:
  //     'Group work usually lives in scattered chats, random files, and last-minute panic. Nobody is sure who owns what, progress is invisible, and consistent contribution is hard to measure or encourage.',

  //   solution:
  //     'I created a single workspace for group assignments: clear ownership, trackable progress, and leaderboards that make steady work visible. The system runs on an Express + MongoDB backend with authenticated users and a React frontend focused on clarity and speed.',

  //   features: [
  //     {
  //       title: 'Assignment management',
  //       desc: 'Create, assign, and track group work from one structured board instead of scattered chats.',
  //     },
  //     {
  //       title: 'Ownership & progress',
  //       desc: 'Each task has clear responsibility and status, so teams always know what is moving.',
  //     },
  //     {
  //       title: 'Gamified contribution',
  //       desc: 'Points and progress make consistent work visible without turning the product into a gimmick.',
  //     },
  //     {
  //       title: 'Leaderboards',
  //       desc: 'Transparent rankings that reward steady participation and create healthy accountability.',
  //     },
  //     {
  //       title: 'Authenticated accounts',
  //       desc: 'Personal accounts so contribution, scores, and assignment history stay accurate.',
  //     },
  //     {
  //       title: 'API-driven architecture',
  //       desc: 'Express and MongoDB power users, assignments, and scoring with a clean data flow.',
  //     },
  //   ],

  //   challenges: [
  //     {
  //       challenge:
  //         'Designing a scoring system that felt motivating without feeling unfair or easy to game.',
  //       solution:
  //         'Kept the rules simple, transparent, and tied to meaningful actions so rankings were easy to trust.',
  //     },
  //     {
  //       challenge:
  //         'Balancing feature depth with a UI students would actually understand quickly.',
  //       solution:
  //         'Prioritised a clear information hierarchy and removed friction from the most common flows: create, assign, update, check progress.',
  //     },
  //   ],
  // },

  // {
  //   id: 4,
  //   title: 'Garden',
  //   category: 'Community Platform',
  //   image: '/images/garden.png',
  //   year: '2024',
  //   description:
  //     'A gardening community product with profile-style gardener highlights, motion-rich browsing, and a full backend for dynamic content.',
  //   link: 'https://gardening-hub-a68ec.web.app/',
  //   github: 'https://github.com/AananMunna/gardening-hub',
  //   tags: ['tailwind', 'react', 'mongodb', 'express'],

  //   tagline: 'A gardening community that feels like people, not a catalogue.',
  //   role: 'Full-stack Developer',
  //   type: 'Full-stack web application',
  //   status: 'Live',

  //   overview:
  //     'Garden is a community-oriented gardening platform focused on people and discovery. Instead of a static catalogue, it highlights gardeners through profile-style presentation, supported by smooth browsing interactions and a backend for dynamic content.',

  //   problem:
  //     'Many gardening sites feel like static product pages. Enthusiasts want to discover real people, real gardens, and a sense of community — not only lists of plants or tips with no personality.',

  //   solution:
  //     'I built a visually rich community hub where gardeners are presented like profiles, content is browsable through smooth sliders, and motion adds life without hurting performance. Dynamic data is handled through an Express + MongoDB backend.',

  //   features: [
  //     {
  //       title: 'Featured Gardener profiles',
  //       desc: 'Profile-style cards that put real people and their gardens at the center of the experience.',
  //     },
  //     {
  //       title: 'Discovery-focused browsing',
  //       desc: 'Swiper-based sections that make exploring content feel fluid on both mobile and desktop.',
  //     },
  //     {
  //       title: 'Motion with restraint',
  //       desc: 'Lottie and interaction details used to add personality without making pages feel heavy.',
  //     },
  //     {
  //       title: 'Dynamic backend',
  //       desc: 'Express and MongoDB support community content that can change without rebuilding the UI.',
  //     },
  //     {
  //       title: 'Responsive layout system',
  //       desc: 'Mobile-first Tailwind interface that stays clean across screen sizes.',
  //     },
  //   ],

  //   challenges: [
  //     {
  //       challenge:
  //         'Adding motion and visual richness without hurting load time or making the UI feel noisy.',
  //       solution:
  //         'Used lightweight animation approaches and kept motion purposeful — supporting hierarchy, not decorating every section.',
  //     },
  //     {
  //       challenge:
  //         'Making a community product feel human while still remaining structured and scalable.',
  //       solution:
  //         'Centered the UI around people and profiles first, then layered content discovery around that core idea.',
  //     },
  //   ],
  // },

  // {
  //   id: 5,
  //   title: 'Othoba',
  //   category: 'E-Commerce UI',
  //   image: '/images/othoba.png',
  //   year: '2024',
  //   description:
  //     'A high-fidelity frontend reconstruction of a real Bangladeshi e-commerce experience — built to match production-level UI density and polish.',
  //   link: 'https://clone-othoba.vercel.app/',
  //   github: 'https://github.com/AananMunna/othoba.com',
  //   tags: ['react', 'tailwind'],

  //   tagline: 'A production-level e-commerce interface rebuilt with precision.',
  //   role: 'Frontend Developer',
  //   type: 'Frontend product reconstruction',
  //   status: 'Live',

  //   overview:
  //     'Othoba is a deliberate frontend reconstruction of a real Bangladeshi e-commerce interface. The goal was not a quick lookalike — it was to prove I can read a dense production UI and rebuild its structure, spacing, hierarchy, and component behavior with accuracy.',

  //   problem:
  //     'Most portfolio projects avoid real commercial UI complexity: crowded navigation, repeated product modules, mixed content density, and strict visual consistency. That gap makes it hard to show production frontend discipline.',

  //   solution:
  //     'I rebuilt the interface from scratch in React and Tailwind with a component-driven structure. The focus was fidelity — layout systems, reusable cards, navigation patterns, and responsive behavior that hold up against a real retail site.',

  //   features: [
  //     {
  //       title: 'High-fidelity layout system',
  //       desc: 'Spacing, type scale, and section structure matched to the density of a real e-commerce storefront.',
  //     },
  //     {
  //       title: 'Reusable commercial components',
  //       desc: 'Product cards, banners, navigation blocks, and content sections built as consistent UI units.',
  //     },
  //     {
  //       title: 'Responsive storefront behavior',
  //       desc: 'Careful adaptation from mobile to wide desktop without breaking hierarchy or scanability.',
  //     },
  //     {
  //       title: 'Production UI discipline',
  //       desc: 'Treated visual polish and consistency as product requirements, not optional styling.',
  //     },
  //   ],

  //   challenges: [
  //     {
  //       challenge:
  //         'Reproducing a dense retail interface without letting the codebase become messy.',
  //       solution:
  //         'Broke the page into reusable components early and standardised spacing and card patterns across sections.',
  //     },
  //     {
  //       challenge:
  //         'Keeping the rebuild responsive while preserving the original visual weight of the desktop experience.',
  //       solution:
  //         'Designed mobile adaptations around hierarchy first — what users need to scan — instead of simply shrinking desktop layouts.',
  //     },
  //   ],
  // },

  // {
  //   id: 6,
  //   title: 'ValoDeal',
  //   category: 'E-Commerce Deals',
  //   image: '/images/valodeal.png',
  //   year: '2024',
  //   description:
  //     'A deal-focused shopping product with fast filtering, in-place product inspection, and motion designed to feel smooth rather than decorative.',
  //   link: 'https://valo-deal.vercel.app/',
  //   github: 'https://github.com/AananMunna/ValoDeal',
  //   tags: ['react', 'tailwind'],

  //   tagline: 'Discount discovery with a fast, low-friction shopping flow.',
  //   role: 'Frontend Developer',
  //   type: 'E-commerce web application',
  //   status: 'Live',

  //   overview:
  //     'ValoDeal is a deal-driven shopping experience built for quick comparison and low-friction product inspection. Shoppers can filter offers, open details without losing context, and move through the catalogue with smooth, restrained motion.',

  //   problem:
  //     'Deal platforms often fail in the details: slow browsing, weak filtering, and product views that break the user’s flow. When comparison is the job to be done, friction means missed decisions.',

  //   solution:
  //     'I focused on browsing speed and continuity — filterable listings, detail modals that preserve context, and transitions that make the interface feel responsive without becoming a distraction.',

  //   features: [
  //     {
  //       title: 'Fast product filtering',
  //       desc: 'Helps users narrow deals quickly instead of scrolling through noise.',
  //     },
  //     {
  //       title: 'In-place detail modals',
  //       desc: 'Inspect a product without leaving the listing or losing scroll position.',
  //     },
  //     {
  //       title: 'Motion for clarity',
  //       desc: 'Framer Motion transitions used to support flow and feedback, not decoration.',
  //     },
  //     {
  //       title: 'Responsive shopping UI',
  //       desc: 'A catalogue experience that stays usable and clean from mobile to desktop.',
  //     },
  //   ],

  //   challenges: [
  //     {
  //       challenge:
  //         'Making filtering and detail views feel instant while keeping the interface simple.',
  //       solution:
  //         'Kept state local to the catalogue flow and avoided full-page navigations for product inspection.',
  //     },
  //     {
  //       challenge:
  //         'Using animation in an e-commerce context without making it feel gimmicky.',
  //       solution:
  //         'Limited motion to meaningful transitions — opening details, switching context, and soft feedback on interaction.',
  //     },
  //   ],
  // },
];
