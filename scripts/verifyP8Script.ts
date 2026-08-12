import mongoose from 'mongoose';
import { connectDB } from '../backend/src/config/db.js';
import { VenueModel } from '../backend/src/models/Venue.js';
import { HotelModel } from '../backend/src/models/Hotel.js';
import { RestaurantModel } from '../backend/src/models/Restaurant.js';
import { EventModel } from '../backend/src/models/Event.js';
import { SportsEventModel } from '../backend/src/models/SportsEvent.js';
import { AttractionModel } from '../backend/src/models/Attraction.js';
import { ExperienceModel } from '../backend/src/models/Experience.js';
import { TravelPackageModel } from '../backend/src/models/TravelPackage.js';
import { TravelTransferModel } from '../backend/src/models/TravelTransfer.js';

async function verifyGeoJSONAndIndexes() {
  console.log('--- STARTING P8 VERIFICATION SCRIPT ---');
  await connectDB();

  const models = [
    { name: 'Venue', model: VenueModel },
    { name: 'Hotel', model: HotelModel },
    { name: 'Restaurant', model: RestaurantModel },
    { name: 'Event', model: EventModel },
    { name: 'SportsEvent', model: SportsEventModel },
    { name: 'Attraction', model: AttractionModel },
    { name: 'Experience', model: ExperienceModel },
    { name: 'TravelPackage', model: TravelPackageModel },
    { name: 'TravelTransfer', model: TravelTransferModel },
  ];

  let allGeoJSONValid = true;
  let allIndexesExist = true;

  for (const { name, model } of models) {
    // Ensure indexes are built
    await model.syncIndexes().catch((err) => console.error(`Error syncing indexes for ${name}:`, err.message));

    const indexes = await model.collection.getIndexes();
    console.log(`\n📌 Indexes for ${name}:`, Object.keys(indexes));

    const has2dSphere = Object.values(indexes).some((idx: any) =>
      idx.some((field: any) => field.locationGeo === '2dsphere' || field[0] === 'locationGeo' && field[1] === '2dsphere')
      || JSON.stringify(idx).includes('2dsphere')
    );

    if (has2dSphere) {
      console.log(`✅ [2dsphere Index] ${name} has active 2dsphere index!`);
    } else {
      console.error(`❌ [2dsphere Index] ${name} is MISSING 2dsphere index!`);
      allIndexesExist = false;
    }

    const docs = await model.find({}).lean();
    console.log(`  Checking ${docs.length} documents for ${name}...`);

    for (const doc of docs as any[]) {
      if (doc.locationGeo) {
        const { type, coordinates } = doc.locationGeo;
        if (type !== 'Point' || !Array.isArray(coordinates) || coordinates.length !== 2) {
          console.error(`❌ Invalid GeoJSON structure in ${name} (id: ${doc._id}):`, doc.locationGeo);
          allGeoJSONValid = false;
        } else {
          const [lng, lat] = coordinates;
          if (typeof lng !== 'number' || typeof lat !== 'number' || isNaN(lng) || isNaN(lat)) {
            console.error(`❌ Non-numeric coordinates in ${name} (id: ${doc._id}):`, coordinates);
            allGeoJSONValid = false;
          } else if (lng < -180 || lng > 180 || lat < -90 || lat > 90) {
            console.error(`❌ Coordinates out of range in ${name} (id: ${doc._id}):`, coordinates);
            allGeoJSONValid = false;
          } else {
            // Also check if latitude/longitude properties on model match coordinates [lng, lat]
            if (doc.latitude !== undefined && doc.longitude !== undefined) {
              if (Math.abs(doc.longitude - lng) > 0.0001 || Math.abs(doc.latitude - lat) > 0.0001) {
                console.warn(`⚠️ Mismatch between (lat,lng) and locationGeo coordinates in ${name} (id: ${doc._id}): lat=${doc.latitude}, lng=${doc.longitude}, coords=${coordinates}`);
              }
            }
          }
        }
      } else {
        console.warn(`⚠️ Document in ${name} (id: ${doc._id}, title/name: ${doc.title || doc.name}) has no locationGeo.`);
      }
    }
  }

  console.log(`\n================ SUMMARY ================`);
  console.log(`GeoJSON Valid: ${allGeoJSONValid ? 'YES ✅' : 'NO ❌'}`);
  console.log(`2dsphere Indexes Exist in DB: ${allIndexesExist ? 'YES ✅' : 'NO ❌'}`);

  await mongoose.disconnect();
}

verifyGeoJSONAndIndexes().catch((err) => {
  console.error('Fatal error in script:', err);
  process.exit(1);
});
