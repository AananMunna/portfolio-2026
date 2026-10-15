/**
 * Project data — single source of truth for the gallery AND the detail view.
 *
 * NOTE: the long-form fields (tagline, overview, problem, solution, features,
 * challenges) were written from your short descriptions. Please read each one
 * and edit it so it reflects what you actually built — recruiters read this.
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
  description: string; // short — used by the gallery
  link: string;
  github: string;
  tags: string[];

  // ── detail view ──
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
    title: 'TripTale',
    category: 'Travel Platform',
    image: '/images/trip.png',
    year: '2024',
    description: 'Built for travelers who want to share stories, not just photos. Full auth, maps, community — shipped solo.',
    link: 'https://peppy-youtiao-479900.netlify.app/',
    github: 'https://github.com/AananMunna/trip-tale-client',
    tags: ['react', 'express', 'mongodb', 'tailwind'],
    tagline: 'A travel community where the story matters more than the photo.',
    role: 'Sole Developer',
    type: 'Full-stack web app',
    status: 'Live',
    overview:
      'TripTale is built for travelers who want to share the story behind a trip, not just a grid of photos. It combines authentication, map-based places and a community feed into one product — designed, built and shipped end to end by me.',
    problem:
      'Most social platforms reward a single photo. The context — where you went, what happened, what you would tell a friend — gets lost, and travelers have no good home for their stories.',
    solution:
      'A story-first platform: travelers publish trips with places on a map, read other people’s journeys and interact inside a community, all behind a secure login.',
    features: [
      { title: 'Secure authentication', desc: 'Sign up, log in and protected routes so every traveler owns their stories.' },
      { title: 'Story-first publishing', desc: 'Trips are written as stories, with the photos supporting the narrative.' },
      { title: 'Maps & places', desc: 'Stories are tied to real locations so readers can explore where things happened.' },
      { title: 'Community', desc: 'Browse, discover and engage with other travelers’ journeys.' },
      { title: 'REST API + database', desc: 'Express API with MongoDB for users, stories and community data.' },
      { title: 'Fully responsive', desc: 'Designed to read and post comfortably on phone, tablet and desktop.' },
    ],
    challenges: [
      {
        challenge: 'Keeping auth, API and UI in sync as a solo developer.',
        solution: 'Kept a clear separation between client and server and protected routes on both sides.',
      },
      {
        challenge: 'Making content-heavy pages feel fast.',
        solution: 'Optimised images and kept components small so story pages load and scroll smoothly.',
      },
    ],
  },
  {
    id: 2,
    title: 'StudySync',
    category: 'Study Platform',
    image: '/images/study.png',
    year: '2024',
    description: 'Turned the chaos of group assignments into a structured, gamified experience. Leaderboards included.',
    link: 'https://studysync-d270a.web.app/',
    github: 'https://github.com/AananMunna/studySync',
    tags: ['react', 'tailwind', 'express', 'mongodb'],
    tagline: 'Group assignments, finally organised — and a little competitive.',
    role: 'Sole Developer',
    type: 'Full-stack web app',
    status: 'Live',
    overview:
      'StudySync turns the messy reality of group assignments into a structured, trackable and gamified experience. Students see what needs doing, who is doing it and how the group is performing.',
    problem:
      'Group work lives in scattered chats and last-minute panic. Nobody is sure who owns what, and there is little motivation to contribute consistently.',
    solution:
      'A single place to manage assignments with clear ownership and progress, plus leaderboards that make steady contribution visible and a bit fun.',
    features: [
      { title: 'Assignment management', desc: 'Create, assign and track group work in one structured place.' },
      { title: 'Gamified progress', desc: 'Points and progress make consistent contribution rewarding.' },
      { title: 'Leaderboards', desc: 'See how members rank to keep everyone motivated.' },
      { title: 'Authentication', desc: 'Personal accounts so each member’s work is tracked correctly.' },
      { title: 'API + database', desc: 'Express and MongoDB powering users, assignments and scores.' },
      { title: 'Responsive UI', desc: 'Clean, mobile-friendly interface built with Tailwind CSS.' },
    ],
    challenges: [
      {
        challenge: 'Designing a scoring system that feels fair.',
        solution: 'Kept the rules simple and transparent so rankings are easy to understand.',
      },
    ],
  },
  {
    id: 3,
    title: 'Garden',
    category: 'E-Commerce / Social',
    image: '/images/garden.png',
    year: '2024',
    description:
      "A modern gardening-themed website featuring Swiper sliders, Lottie animations, and a custom 'Featured Gardeners' section styled like social media profiles. Built with React and Tailwind for clean, responsive design.",
    link: 'https://gardening-hub-a68ec.web.app/',
    github: 'https://github.com/AananMunna/gardening-hub',
    tags: ['tailwind', 'react', 'mongodb', 'express'],
    tagline: 'A gardening community that feels like a social profile, not a catalogue.',
    role: 'Sole Developer',
    type: 'Full-stack web app',
    status: 'Live',
    overview:
      'Garden is a modern gardening-themed website that mixes community and discovery. A custom “Featured Gardeners” section is styled like social-media profiles, surrounded by smooth Swiper sliders and Lottie animations.',
    problem:
      'Gardening sites tend to be static catalogues. Enthusiasts want to see real people and their gardens, and the experience should feel alive.',
    solution:
      'A visually rich community hub that highlights gardeners as profiles, uses motion to add personality and stays clean and responsive across devices.',
    features: [
      { title: 'Featured Gardeners', desc: 'Profile-style cards that put real people at the centre of the site.' },
      { title: 'Swiper sliders', desc: 'Smooth, touch-friendly sliders for browsing content.' },
      { title: 'Lottie animations', desc: 'Lightweight vector animations that add personality without slowing the page.' },
      { title: 'Backend powered', desc: 'Express and MongoDB handle the dynamic community data.' },
      { title: 'Responsive design', desc: 'Built mobile-first with Tailwind for a consistent look everywhere.' },
    ],
  },
  {
    id: 4,
    title: 'Othoba',
    category: 'E-Commerce',
    image: '/images/othoba.png',
    year: '2024',
    description: 'Pixel-perfect clone of a real BD e-commerce site. Proved I can match production-level UI standards.',
    link: 'https://clone-othoba.vercel.app/',
    github: 'https://github.com/AananMunna/othoba.com',
    tags: ['react', 'tailwind'],
    tagline: 'A pixel-perfect rebuild of a real Bangladeshi e-commerce site.',
    role: 'Sole Developer',
    type: 'Frontend clone',
    status: 'Live',
    overview:
      'Othoba is a frontend clone of a real Bangladeshi e-commerce website. The goal was to prove I can read a production design and reproduce its layout, spacing and behaviour accurately.',
    problem:
      'Tutorial projects rarely face real-world UI complexity — dense layouts, many components and strict visual standards.',
    solution:
      'I rebuilt the interface from scratch with React and Tailwind, matching the original’s structure and polish while keeping the code componentised and responsive.',
    features: [
      { title: 'Pixel-perfect layout', desc: 'Spacing, typography and structure closely match the original site.' },
      { title: 'Component architecture', desc: 'Reusable React components for cards, sections and navigation.' },
      { title: 'Responsive', desc: 'Adapts cleanly from mobile to wide desktop screens.' },
      { title: 'Production-level standards', desc: 'Built to the detail level expected from a live e-commerce product.' },
    ],
  },
  {
    id: 5,
    title: 'ValoDeal',
    category: 'E-Commerce Deal Platform',
    image: '/images/valodeal.png',
    year: '2024',
    description:
      'An eCommerce deal platform offering exclusive products at discounted prices. Built using the MERN stack with features like product filtering, detail modals, and smooth animations using Framer Motion.',
    link: 'https://valo-deal.vercel.app/',
    github: 'https://github.com/AananMunna/ValoDeal',
    tags: ['react', 'tailwind'],
    tagline: 'Exclusive products at discounted prices, with motion that feels premium.',
    role: 'Sole Developer',
    type: 'E-commerce web app',
    status: 'Live',
    overview:
      'ValoDeal is an e-commerce deal platform that surfaces exclusive products at discounted prices. It focuses on fast browsing, quick product inspection and smooth, tasteful animation.',
    problem:
      'Deal hunters want to compare and filter quickly. Slow pages and clunky product views make good offers easy to miss.',
    solution:
      'A fast, filterable catalogue with detail modals so shoppers can inspect a product without losing their place, polished with Framer Motion transitions.',
    features: [
      { title: 'Product filtering', desc: 'Narrow down deals quickly to find what matters.' },
      { title: 'Detail modals', desc: 'Inspect a product in place without leaving the listing.' },
      { title: 'Framer Motion animations', desc: 'Smooth transitions that make the interface feel responsive and premium.' },
      { title: 'Responsive layout', desc: 'Shopping experience that works equally well on mobile and desktop.' },
    ],
  },
];