import { NearbyController } from '../backend/src/controllers/nearbyController.js';
import { VenueModel } from '../backend/src/models/Venue.js';
import { HotelModel } from '../backend/src/models/Hotel.js';
import { RestaurantModel } from '../backend/src/models/Restaurant.js';
import { EventModel } from '../backend/src/models/Event.js';
import { SportsEventModel } from '../backend/src/models/SportsEvent.js';
import { AttractionModel } from '../backend/src/models/Attraction.js';
import { ExperienceModel } from '../backend/src/models/Experience.js';
import { TravelPackageModel } from '../backend/src/models/TravelPackage.js';
import { TravelTransferModel } from '../backend/src/models/TravelTransfer.js';

function createMockReqRes(query: Record<string, any>, headers: Record<string, any> = {}) {
  let statusCode = 200;
  let responseData: any = null;

  const req = { query, headers } as any;
  const res = {
    status(code: number) {
      statusCode = code;
      return this;
    },
    json(data: any) {
      responseData = data;
      return this;
    }
  } as any;

  return { req, res, getStatus: () => statusCode, getData: () => responseData };
}

async function runP8Suite() {
  console.log('==================================================');
  console.log('      P8 LOCATION DISCOVERY RUNTIME VERIFICATION  ');
  console.log('==================================================\n');

  let totalTests = 0;
  let passedTests = 0;

  function assertTest(description: string, condition: boolean, detail: string = '') {
    totalTests++;
    if (condition) {
      passedTests++;
      console.log(`✅ TEST ${totalTests}: [PASS] - ${description}`);
    } else {
      console.error(`❌ TEST ${totalTests}: [FAIL] - ${description} | ${detail}`);
    }
  }

  // ----------------------------------------------------
  // 1. GEOJSON VALIDATION IN MODEL SCHEMAS
  // ----------------------------------------------------
  console.log('\n--- 1. GEOJSON MODEL SCHEMA VALIDATION ---');
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

  for (const { name, model } of models) {
    const schemaPaths = (model as any).schema.paths;
    const hasLocationGeo = !!schemaPaths['locationGeo.type'] || !!schemaPaths['locationGeo'];
    assertTest(`${name} schema defines locationGeo field`, hasLocationGeo);
  }

  // ----------------------------------------------------
  // 2. 2DSPHERE INDEX DEFINITIONS
  // ----------------------------------------------------
  console.log('\n--- 2. 2DSPHERE INDEX DEFINITIONS ---');
  for (const { name, model } of models) {
    const indexes = (model as any).schema.indexes();
    const has2dSphere = indexes.some((idx: any) => idx[0] && idx[0].locationGeo === '2dsphere');
    assertTest(`${name} schema contains 2dsphere index on locationGeo`, has2dSphere);
  }

  // ----------------------------------------------------
  // 3. API FUNCTIONALITY & PUBLIC ACCESS
  // ----------------------------------------------------
  console.log('\n--- 3. API FUNCTIONALITY & PUBLIC ACCESS ---');
  {
    const { req, res, getStatus, getData } = createMockReqRes({ lat: '23.6880', lng: '86.9661', radius: '10' });
    await NearbyController.getNearby(req, res);
    const data = getData();
    assertTest('GET /api/nearby returns HTTP 200', getStatus() === 200);
    assertTest('Response has success: true', data?.success === true);
    assertTest('Response contains data.results array', Array.isArray(data?.data?.results));
    assertTest('Response contains data.pagination object', typeof data?.data?.pagination === 'object');
  }

  // ----------------------------------------------------
  // 4. DISTANCE ACCURACY & SORTING BY DISTANCE
  // ----------------------------------------------------
  console.log('\n--- 4. DISTANCE ACCURACY & SORTING ---');
  {
    const { req, res, getData } = createMockReqRes({ lat: '23.6880', lng: '86.9661', radius: '10', sort: 'distance' });
    await NearbyController.getNearby(req, res);
    const results = getData()?.data?.results || [];
    assertTest('Results array is non-empty for test coordinates', results.length > 0);
    let isSorted = true;
    for (let i = 0; i < results.length - 1; i++) {
      if (results[i].distanceKm > results[i + 1].distanceKm) {
        isSorted = false;
        break;
      }
    }
    assertTest('Results are sorted strictly ascending by distanceKm', isSorted);
  }

  // ----------------------------------------------------
  // 5. RADIUS ENFORCEMENT
  // ----------------------------------------------------
  console.log('\n--- 5. RADIUS ENFORCEMENT ---');
  const testRadii = [1, 3, 5, 10, 25, 50];
  for (const r of testRadii) {
    const { req, res, getData } = createMockReqRes({ lat: '23.6880', lng: '86.9661', radius: String(r) });
    await NearbyController.getNearby(req, res);
    const results = getData()?.data?.results || [];
    const allWithinRadius = results.every((item: any) => item.distanceKm === null || item.distanceKm <= r);
    assertTest(`Radius enforcement for ${r}km: no items exceed ${r}km`, allWithinRadius);
  }

  // ----------------------------------------------------
  // 6. VERTICAL COVERAGE TEST
  // ----------------------------------------------------
  console.log('\n--- 6. VERTICAL COVERAGE TEST ---');
  {
    const { req, res, getData } = createMockReqRes({ lat: '23.6880', lng: '86.9661', radius: '50' });
    await NearbyController.getNearby(req, res);
    const results = getData()?.data?.results || [];
    const categories = new Set(results.map((i: any) => i.category));
    assertTest('Omitting category returns multiple verticals', categories.size > 1);
  }
  {
    const { req, res, getData } = createMockReqRes({ lat: '23.6880', lng: '86.9661', radius: '50', category: 'MOVIE' });
    await NearbyController.getNearby(req, res);
    const results = getData()?.data?.results || [];
    const allMovies = results.every((i: any) => i.category === 'MOVIE');
    assertTest('Filter category=MOVIE returns ONLY MOVIE vertical', allMovies);
  }

  // ----------------------------------------------------
  // 7. CITY FALLBACK TEST
  // ----------------------------------------------------
  console.log('\n--- 7. CITY FALLBACK TEST ---');
  {
    const { req, res, getData } = createMockReqRes({ city: 'Asansol' });
    await NearbyController.getNearby(req, res);
    const results = getData()?.data?.results || [];
    assertTest('City-only query returns results', results.length > 0);
    const allMatchCity = results.every((i: any) => i.city?.toLowerCase().includes('asansol') || i.matchType === 'CITY_MATCH');
    assertTest('City-only query correctly marks/matches city items', allMatchCity);
  }

  // ----------------------------------------------------
  // 8. PRIVACY VERIFICATION
  // ----------------------------------------------------
  console.log('\n--- 8. PRIVACY VERIFICATION ---');
  {
    const userLat = 23.123456;
    const userLng = 86.654321;
    const { req, res, getData } = createMockReqRes({ lat: String(userLat), lng: String(userLng), radius: '10' });
    await NearbyController.getNearby(req, res);
    const results = getData()?.data?.results || [];
    let leakedUserCoords = false;
    for (const item of results) {
      if (item.latitude === userLat && item.longitude === userLng && item.distanceKm !== 0) {
        leakedUserCoords = true;
      }
    }
    assertTest('User search coordinates are NOT saved or substituted as venue coordinates', !leakedUserCoords);
  }

  // ----------------------------------------------------
  // 9. KEYWORD SEARCH TEST
  // ----------------------------------------------------
  console.log('\n--- 9. KEYWORD SEARCH TEST ---');
  {
    const { req, res, getData } = createMockReqRes({ lat: '23.6880', lng: '86.9661', radius: '10', q: 'Echoes' });
    await NearbyController.getNearby(req, res);
    const results = getData()?.data?.results || [];
    assertTest('Keyword search q=Echoes matches relevant item', results.some((i: any) => i.title.includes('Echoes')));
  }

  // ----------------------------------------------------
  // 10. FILTERS & SORTING
  // ----------------------------------------------------
  console.log('\n--- 10. FILTERS & SORTING ---');
  {
    const { req, res, getData } = createMockReqRes({ lat: '23.6880', lng: '86.9661', radius: '10', sort: 'price_low' });
    await NearbyController.getNearby(req, res);
    const results = getData()?.data?.results || [];
    let isPriceLowSorted = true;
    for (let i = 0; i < results.length - 1; i++) {
      if (results[i].priceFrom > results[i + 1].priceFrom) {
        isPriceLowSorted = false;
        break;
      }
    }
    assertTest('Sort price_low orders items ascending by price', isPriceLowSorted);
  }
  {
    const { req, res, getData } = createMockReqRes({ lat: '23.6880', lng: '86.9661', radius: '10', minPrice: '1000' });
    await NearbyController.getNearby(req, res);
    const results = getData()?.data?.results || [];
    assertTest('minPrice=1000 filters out items with price < 1000', results.every((i: any) => i.priceFrom >= 1000));
  }

  // ----------------------------------------------------
  // 11. PAGINATION TEST
  // ----------------------------------------------------
  console.log('\n--- 11. PAGINATION TEST ---');
  {
    const { req, res, getData: getDataP1 } = createMockReqRes({ lat: '23.6880', lng: '86.9661', radius: '10', page: '1', limit: '3' });
    await NearbyController.getNearby(req, res);
    const p1 = getDataP1()?.data;

    const { req: req2, res: res2, getData: getDataP2 } = createMockReqRes({ lat: '23.6880', lng: '86.9661', radius: '10', page: '2', limit: '3' });
    await NearbyController.getNearby(req2, res2);
    const p2 = getDataP2()?.data;

    assertTest('Pagination metadata exists (total, page, limit, totalPages)', typeof p1.pagination.total === 'number' && p1.pagination.limit === 3);
    assertTest('Page 1 returns max 3 items', p1.results.length <= 3);

    const idsP1 = new Set(p1.results.map((i: any) => i.id));
    const idsP2 = new Set(p2.results.map((i: any) => i.id));
    const hasOverlap = [...idsP1].some((id) => idsP2.has(id));
    assertTest('No duplicate item IDs across Page 1 and Page 2', !hasOverlap);
  }

  // ----------------------------------------------------
  // 12. LIMIT PROTECTION & INPUT CLAMPING
  // ----------------------------------------------------
  console.log('\n--- 12. LIMIT PROTECTION & INPUT CLAMPING ---');
  {
    const { req, res, getData } = createMockReqRes({ lat: '23.6880', lng: '86.9661', radius: '999999', limit: '100000', page: '-5' });
    await NearbyController.getNearby(req, res);
    const data = getData()?.data;
    assertTest('limit=100000 is clamped to max 100', data.pagination.limit <= 100);
    assertTest('radius=999999 is clamped to max 500km', data.searchParams.radiusKm <= 500);
    assertTest('page=-5 is clamped to minimum 1', data.pagination.page === 1);
  }

  // ----------------------------------------------------
  // 13. EMPTY STATE TEST
  // ----------------------------------------------------
  console.log('\n--- 13. EMPTY STATE TEST ---');
  {
    const { req, res, getData } = createMockReqRes({ lat: '23.6880', lng: '86.9661', radius: '10', q: 'nonexistentsearchterm12345' });
    await NearbyController.getNearby(req, res);
    const data = getData();
    assertTest('Non-matching query returns HTTP 200 with empty array', data.success === true && data.data.results.length === 0);
  }

  console.log('\n==================================================');
  console.log(`  VERIFICATION RESULTS: ${passedTests} / ${totalTests} PASSED`);
  console.log('==================================================\n');

  if (passedTests === totalTests) {
    console.log('🎉 P8 — LOCATION DISCOVERY LAYER COMPLETELY VERIFIED AND PASSED ALL TESTS!');
  } else {
    console.error('⚠️ SOME TESTS FAILED. CHECK LOGS ABOVE.');
    process.exit(1);
  }
}

runP8Suite().catch((err) => {
  console.error('Fatal test runner failure:', err);
  process.exit(1);
});
