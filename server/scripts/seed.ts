import { connectDB, disconnectDB } from '../src/config/db.js';
import { Location } from '../src/modules/locations/location.model.js';
import { LocationCategory } from '../src/modules/locations/location.schema.js';

interface SeedLocation {
  name: string;
  description: string;
  category: LocationCategory;
  latitude: number;
  longitude: number;
}

// 12 curated demo locations centered in and around Chandigarh, India.
// Note: Descriptions are provided for demonstration and testing purposes.
const DEMO_LOCATIONS: SeedLocation[] = [
  {
    name: 'Sukhna Lake Promenade',
    description: 'Scenic man-made reservoir at the foothills of the Shivalik hills, popular for evening walks and boating. (Demo Landmark)',
    category: 'landmark',
    latitude: 30.7421,
    longitude: 76.8188,
  },
  {
    name: 'Rock Garden of Chandigarh',
    description: 'Renowned sculpture garden created by Nek Chand from industrial and urban waste materials. (Demo Landmark)',
    category: 'landmark',
    latitude: 30.7525,
    longitude: 76.8073,
  },
  {
    name: 'Zakir Hussain Rose Garden',
    description: 'Expansive botanical garden in Sector 16 spanning over 30 acres with thousands of rose varieties. (Demo Park)',
    category: 'park',
    latitude: 30.7471,
    longitude: 76.7821,
  },
  {
    name: 'Capitol Complex Le Corbusier',
    description: 'UNESCO World Heritage site comprising the High Court, Secretariat, and Open Hand Monument. (Demo Landmark)',
    category: 'landmark',
    latitude: 30.7592,
    longitude: 76.8028,
  },
  {
    name: 'Backyard Roastery Cafe',
    description: 'Artisanal micro-roastery offering specialty pour-overs and fresh bakery goods. (Demo Cafe)',
    category: 'cafe',
    latitude: 30.7369,
    longitude: 76.7885,
  },
  {
    name: 'Sector 17 Pedestrian Plaza',
    description: 'Iconic open-air shopping and entertainment square designed by Le Corbusier. (Demo Store)',
    category: 'store',
    latitude: 30.7415,
    longitude: 76.7849,
  },
  {
    name: 'Shivalik View Botanical Trail',
    description: 'Quiet green corridor with native trees, jogging paths, and birdwatching observation points. (Demo Park)',
    category: 'park',
    latitude: 30.7512,
    longitude: 76.7725,
  },
  {
    name: 'The Espresso Library Cafe',
    description: 'Cozy study lounge and cafe featuring quiet work pods and curated origin coffee. (Demo Cafe)',
    category: 'cafe',
    latitude: 30.7268,
    longitude: 76.7645,
  },
  {
    name: 'Elante Promenade Retail Hub',
    description: 'Major regional destination with global brands, bookstores, and technology shops. (Demo Store)',
    category: 'store',
    latitude: 30.7055,
    longitude: 76.8013,
  },
  {
    name: 'Chandigarh Central Postal & Courier',
    description: 'Full-service postal hub and courier center serving Sectors 15 through 22. (Demo Service)',
    category: 'service',
    latitude: 30.7388,
    longitude: 76.7762,
  },
  {
    name: 'Terraced Garden Sector 33',
    description: 'Beautiful landscaped garden known for lighted musical fountains and annual chrysanthemum shows. (Demo Park)',
    category: 'park',
    latitude: 30.7182,
    longitude: 76.7699,
  },
  {
    name: 'City Cycle & Mobility Repair Hub',
    description: 'Community repair depot providing bicycle maintenance, puncture fixes, and e-scooter charging. (Demo Service)',
    category: 'service',
    latitude: 30.7302,
    longitude: 76.7798,
  },
];

export async function seedDatabase(): Promise<void> {
  console.log('🌱 Starting idempotent database seeding...');
  await connectDB();

  let insertedCount = 0;
  let updatedCount = 0;

  for (const loc of DEMO_LOCATIONS) {
    // Idempotent upsert by name to preserve any existing user data while ensuring demo locations exist
    const result = await Location.findOneAndUpdate(
      { name: loc.name },
      { $set: loc },
      { upsert: true, new: true, rawResult: true }
    );

    if (result.lastErrorObject?.updatedExisting) {
      updatedCount++;
    } else {
      insertedCount++;
    }
  }

  console.log(`✅ Seeding complete. Inserted: ${insertedCount}, Updated: ${updatedCount}`);
  await disconnectDB();
}

// Execute directly if run as CLI script
if (process.argv[1]?.includes('seed')) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('❌ Seeding failed:', err);
      process.exit(1);
    });
}
