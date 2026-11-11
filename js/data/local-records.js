/**
 * js/data/local-records.js
 * ============================================================
 * ALL demo content lives here.
 * To add, remove or edit items: update the arrays below,
 * save the file, and refresh the browser. No build step needed.
 *
 * REMINDER: This data is entirely fictional and for demo purposes only.
 * ============================================================
 */

// ── DEALS ────────────────────────────────────────────────────────────────────
const dealsData = [
  {
    id: 1,
    business_name: "4B restaurant and cafe",
    category: "restaurant",
    discount: "15% OFF",
    description:
      "Enjoy a 15% student discount on shawarma platters and combo meals at 4B restaurant and cafe.",
    terms: "Valid on dine-in orders only. Cannot be combined with other offers.",
    valid_until: "Demo Date – Dec 2025",
    location: "Demo Street 4, University District, Zakho (fictional)",
    how_to_use: "Show your university ID at the counter.",
  },
  {
    id: 2,
    business_name: "Demo Cafe Aroma",
    category: "cafe",
    image: "assets/images/golverdi.png",
    discount: "10% OFF",
    description:
      "Get 10% off any hot or cold drink at Demo Cafe Aroma. A cozy spot for studying with free Wi-Fi and plenty of seating.",
    terms: "One discount per visit. Valid Sunday–Thursday only.",
    valid_until: "Demo Date – Mar 2026",
    location: "Demo Avenue 12, City Center, Zakho (fictional)",
    how_to_use: "Show your university ID at the counter.",
  },
  {
    id: 3,
    business_name: "Demo FitZone Gym",
    category: "gym",
    discount: "20% OFF",
    description:
      "Students get 20% off monthly membership fees at Demo FitZone Gym. Includes access to cardio machines, weights and group classes.",
    terms: "Student must enroll for a minimum of one month. ID verified at registration.",
    valid_until: "Demo Date – Jun 2026",
    location: "Demo Boulevard 8, Sports District, Zakho (fictional)",
    how_to_use: "Show your university ID at the counter.",
  },
  {
    id: 4,
    business_name: "Demo Book Corner",
    category: "shop",
    discount: "25% OFF",
    description:
      "25% off all stationery, notebooks and study supplies at Demo Book Corner. Perfect for students stocking up at the start of term.",
    terms: "Discount applies to non-sale items only. Maximum purchase: 50,000 IQD per visit.",
    valid_until: "Demo Date – Sep 2025",
    location: "Demo Market Lane 3, Old Town, Zakho (fictional)",
    how_to_use: "Show your university ID at the counter.",
  },
  {
    id: 5,
    business_name: "Demo Print & Copy",
    category: "other",
    discount: "30% OFF",
    description:
      "Print assignments, theses and posters at 30% student discount. Color and black-and-white printing available.",
    terms: "Applies to standard A4 prints. Large-format printing excluded.",
    valid_until: "Demo Date – Dec 2025",
    location: "Demo Plaza 1, University Gate Area, Zakho (fictional)",
    how_to_use: "Show your university ID at the counter.",
  },
  {
    id: 6,
    business_name: "Demo Pizza Stop",
    category: "restaurant",
    discount: "Buy 2 Get 1",
    description:
      "Buy any two slices and get the third free at Demo Pizza Stop. Great for group study breaks.",
    terms: "Third slice must be of equal or lesser value. Dine-in only.",
    valid_until: "Demo Date – Jan 2026",
    location: "Demo Ring Road 7, West Side, Zakho (fictional)",
    how_to_use: "Show your university ID at the counter.",
  },
  {
    id: 7,
    business_name: "Demo Restaurant Offer",
    category: "restaurant",
    image: "assets/images/image.JB.png",
    discount: "20% OFF",
    description:
      "Example student restaurant offer: 20% off. This is illustrative content, not a verified promotion.",
    terms: "",
    valid_until: "",
    location: "",
    how_to_use: "",
  },
  {
    id: 8,
    business_name: "Y5 coffee shop",
    category: "cafe",
    image: "assets/images/Y5cafe.png",
    discount: "Special offer",
    description:
      "Special offer on selected drinks at Y5 coffee shop. Specific drinks and offer terms were not provided.",
    terms: "",
    valid_until: "",
    location: "",
    how_to_use: "",
  },
  {
    id: 9,
    business_name: "Demo Optical Store",
    category: "health-medical",
    discount: "Demo: 20% OFF prescription glasses",
    description:
      "Demo student offer: 20% off prescription glasses at a fictional optical store. No real provider or discount is verified.",
    terms: "Fictional demo offer only. Product, prescription and eligibility terms are illustrative, not real.",
    valid_until: "",
    location: "Fictional Zakho location (demo only)",
    how_to_use: "Demo only — this offer cannot be redeemed.",
  },
  {
    id: 10,
    business_name: "Demo Dental Clinic",
    category: "health-medical",
    discount: "Demo: 15% OFF consultation",
    description:
      "Demo student offer: 15% off a dental consultation at a fictional clinic. No real provider or discount is verified.",
    terms: "Fictional demo offer only. Services, eligibility and availability are illustrative, not real.",
    valid_until: "",
    location: "Fictional Zakho location (demo only)",
    how_to_use: "Demo only — this offer cannot be redeemed.",
  },
  {
    id: 11,
    business_name: "Demo Eye Clinic",
    category: "health-medical",
    discount: "Demo: Free eye checkup",
    description:
      "Demo student offer: a free basic eye checkup or discounted consultation at a fictional eye clinic. No real provider or service is verified.",
    terms: "Fictional demo offer only. No actual medical service or consultation is provided.",
    valid_until: "",
    location: "Fictional Zakho location (demo only)",
    how_to_use: "Demo only — this offer cannot be redeemed.",
  },
];

// ── BENEFITS ─────────────────────────────────────────────────────────────────
const benefitsData = [
  {
    id: 1,
    name: "Demo Cloud Storage Pro",
    category: "Cloud",
    benefit_type: "Free",
    description:
      "Demo Cloud Storage Pro offers students 100 GB of free cloud storage for the duration of their studies. Upload files, collaborate and access your work from any device.",
    eligibility: "Any student with a valid university email address ending in .edu (fictional).",
    how_to_activate:
      "Visit the demo sign-up page, click 'Student Verification', enter your university email and follow the confirmation link.",
    restrictions: "Personal use only. Commercial use not permitted under this plan.",
    last_verified: "Demo Date – Oct 2025",
  },
  {
    id: 2,
    name: "Demo AI Writing Assistant",
    category: "AI tools",
    benefit_type: "Free plan",
    description:
      "Demo AI Writing Assistant helps students draft essays, summarize research and check grammar. The free student plan includes up to 50 queries per day.",
    eligibility: "Open to all full-time students. University email required.",
    how_to_activate:
      "Register at the demo platform, select 'Student Plan' and verify your enrollment through the automated portal.",
    restrictions: "50 queries per day limit. Advanced models require a paid upgrade.",
    last_verified: "Demo Date – Aug 2025",
  },
  {
    id: 3,
    name: "Demo Dev Toolkit",
    category: "Development",
    benefit_type: "Student discount",
    description:
      "Demo Dev Toolkit provides IDEs, version-control tools and CI/CD pipelines at a 60% student discount. Ideal for computer-science and engineering students.",
    eligibility: "Students enrolled in a technical or engineering degree program.",
    how_to_activate:
      "Apply through the demo education portal with proof of enrollment. Approval takes up to 3 demo business days.",
    restrictions: "License is non-transferable and expires at graduation.",
    last_verified: "Demo Date – Jul 2025",
  },
  {
    id: 4,
    name: "Demo Design Suite",
    category: "Design",
    benefit_type: "Free",
    description:
      "Demo Design Suite gives students free access to vector editing, photo retouching and UI prototyping tools in one browser-based platform.",
    eligibility: "Any enrolled student. No design background required.",
    how_to_activate:
      "Create a free account on the demo platform and select 'I am a Student' during onboarding.",
    restrictions: "Projects are stored online only; offline export requires a paid plan.",
    last_verified: "Demo Date – Sep 2025",
  },
  {
    id: 5,
    name: "Demo Productivity Suite",
    category: "Productivity",
    benefit_type: "Free plan",
    description:
      "Demo Productivity Suite bundles task management, note-taking and calendar tools in one app. The student free plan removes ads and unlocks collaboration features.",
    eligibility: "All university students.",
    how_to_activate:
      "Download the app, tap 'Student Verification' and enter your university email to unlock the free plan instantly.",
    restrictions: "File attachments limited to 10 MB each on the free tier.",
    last_verified: "Demo Date – Jun 2025",
  },
  {
    id: 6,
    name: "Demo Cloud Compute",
    category: "Cloud",
    benefit_type: "Trial",
    description:
      "Demo Cloud Compute offers a 6-month free trial of cloud virtual machines and managed databases — perfect for student projects and thesis research.",
    eligibility: "Students with a university email. One trial account per student.",
    how_to_activate:
      "Sign up on the demo cloud portal, verify your student status and your trial credits are applied automatically.",
    restrictions: "Trial credits expire after 6 months. Credit card not required to sign up.",
    last_verified: "Demo Date – May 2025",
  },
];

// ── HOUSING ───────────────────────────────────────────────────────────────────
const housingData = [
  {
    id: 1,
    title: "Demo Studio near University Gate",
    neighborhood: "Demo University District (fictional)",
    price_per_month: "150,000 IQD",
    room_type: "Single",
    facilities: ["Private bathroom", "Air conditioning", "Wi-Fi", "Desk & chair"],
    description:
      "A compact, furnished studio ideal for a single student. Located a short walk from the demo university main gate. Utilities included in the listed price.",
    contact: "Contact: 0000 000 0000",
  },
  {
    id: 2,
    title: "Demo Shared Room – City Center",
    neighborhood: "Demo City Center (fictional)",
    price_per_month: "80,000 IQD",
    room_type: "Shared",
    facilities: ["Shared bathroom", "Air conditioning", "Wi-Fi", "Kitchen access"],
    description:
      "Affordable shared room in a 4-bedroom flat in the demo city center. Suitable for budget-conscious students. Two students per room.",
    contact: "Contact: 0000 000 0001",
  },
  {
    id: 3,
    title: "Demo 2-Bedroom Apartment",
    neighborhood: "Demo Riverside Area (fictional)",
    price_per_month: "280,000 IQD",
    room_type: "Apartment",
    facilities: ["2 bedrooms", "Living room", "Full kitchen", "2 bathrooms", "Parking"],
    description:
      "Spacious two-bedroom apartment suitable for two or three students sharing costs. Demo Riverside Area is quiet and well-connected by public transport.",
    contact: "Contact: 0000 000 0002",
  },
  {
    id: 4,
    title: "Demo Single Room – North Quarter",
    neighborhood: "Demo North Quarter (fictional)",
    price_per_month: "120,000 IQD",
    room_type: "Single",
    facilities: ["Private bathroom", "Wardrobe", "Wi-Fi", "24-hr security"],
    description:
      "Private single room in a managed student house. Landlord lives on site. Cleaning service once a week included.",
    contact: "Contact: 0000 000 0003",
  },
  {
    id: 5,
    title: "Demo Shared Flat – Market Lane",
    neighborhood: "Demo Old Town Market Lane (fictional)",
    price_per_month: "70,000 IQD",
    room_type: "Shared",
    facilities: ["Shared kitchen", "Laundry room", "Wi-Fi", "Air conditioning"],
    description:
      "Budget shared flat close to the demo old-town market. Common areas are shared by six students. Bills split equally.",
    contact: "Contact: 0000 000 0004",
  },
  {
    id: 6,
    title: "Demo Modern Apartment – Sports District",
    neighborhood: "Demo Sports District (fictional)",
    price_per_month: "320,000 IQD",
    room_type: "Apartment",
    facilities: ["3 bedrooms", "Gym access", "Rooftop", "Covered parking", "Elevator"],
    description:
      "Modern three-bedroom apartment in the demo sports district. Close to Demo FitZone Gym and demo public transport stops. Ideal for a group of three students.",
    contact: "Contact: 0000 000 0005",
  },
];

// ── TRANSPORTATION ────────────────────────────────────────────────────────────
const transportationData = [
  {
    id: 1,
    type: "Bus",
    route_name: "Demo Route 1 – City Center to University",
    pickup_point: "Demo City Center Bus Stop (fictional)",
    dropoff_point: "Demo University Main Gate (fictional)",
    schedule_note: "Demo times: every 30 min, 7:00 AM – 6:00 PM (fictional)",
    fare: "500 IQD per trip (demo price)",
    contact: "Demo Bus Authority: 0000 000 0010",
    duration: null,
    notes: "Illustrative example only; no real service or operator is associated with this route.",
  },
  {
    id: 2,
    type: "Shuttle",
    route_name: "Demo Student Shuttle – North Quarter to University",
    pickup_point: "Demo North Quarter Plaza (fictional)",
    dropoff_point: "Demo University South Entrance (fictional)",
    schedule_note: "Demo times: 8:00 AM and 2:00 PM departure (fictional)",
    fare: "Free for enrolled students (demo only)",
    contact: "Demo Shuttle Office: 0000 000 0011",
    duration: null,
    notes: "Illustrative example only; no real service or operator is associated with this route.",
  },
  {
    id: 3,
    type: "Taxi",
    route_name: "Demo Campus Taxi Service",
    pickup_point: "Anywhere in Demo Zakho (fictional)",
    dropoff_point: "Demo University or City Center (fictional)",
    schedule_note: "Demo times: Available 6:00 AM – 10:00 PM daily (fictional)",
    fare: "Starting from 2,000 IQD (demo price)",
    contact: "Demo Taxi Dispatch: 0000 000 0012",
    duration: null,
    notes: "Illustrative example only; no real service or operator is associated with this route.",
  },
  {
    id: 4,
    type: "Bus",
    route_name: "Demo Route 2 – Riverside to University",
    pickup_point: "Demo Riverside Bus Stand (fictional)",
    dropoff_point: "Demo University West Gate (fictional)",
    schedule_note: "Demo times: every 45 min, 7:30 AM – 5:30 PM (fictional)",
    fare: "500 IQD per trip (demo price)",
    contact: "Demo Bus Authority: 0000 000 0010",
    duration: null,
    notes: "Illustrative example only; no real service or operator is associated with this route.",
  },
  {
    id: 5,
    type: "Minibus",
    route_name: "Demo Route 3 – Zakho to Duhok",
    pickup_point: "Demo Zakho Intercity Stop (fictional)",
    dropoff_point: "Demo Duhok Arrival Point (fictional)",
    schedule_note: "Not available in demo data.",
    fare: "Not available in demo data.",
    contact: "Not available — no real operator.",
    duration: null,
    notes: "Fictional route example; confirm destinations and services with a trusted operator before travel.",
  },
  {
    id: 6,
    type: "Shared taxi",
    route_name: "Demo Shared Taxi Route – Zakho to Semel",
    pickup_point: "Demo Zakho Pickup Point (fictional)",
    dropoff_point: "Demo Semel Drop-off Point (fictional)",
    schedule_note: "Not available in demo data.",
    fare: "Not available in demo data.",
    contact: "Not available — no real operator.",
    duration: null,
    notes: "Fictional route example; confirm destinations and services with a trusted operator before travel.",
  },
];
