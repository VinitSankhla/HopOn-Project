import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "../entities/User";
import { Bike } from "../entities/Bike";
import { Ride } from "../entities/Ride";

export const AppDataSource = new DataSource({
  type: "postgres",
  synchronize: true, // Only for development
  logging: true,
  url: "postgresql://neondb_owner:npg_s8qYxGUR4ZHE@ep-rapid-queen-a1m12yzk-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
  entities: [User, Bike, Ride],
  migrations: [],
  subscribers: [],
});

export const initializeDatabase = async () => {
  try {
    await AppDataSource.initialize();
    console.log("✅ Database connection initialized successfully");

    // Initialize bikes if table is empty
    await initializeBikes();
  } catch (error) {
    console.error("❌ Error during database initialization:", error);
    throw error;
  }
};

const initializeBikes = async () => {
  try {
    const bikeRepository = AppDataSource.getRepository(Bike);
    const bikeCount = await bikeRepository.count();

    if (bikeCount === 0) {
      console.log("🚴‍♂️ Initializing 25 bikes at AB1...");

      const bikes = [];
      for (let i = 1; i <= 25; i++) {
        const bike = new Bike();
        bike.id = `BIKE${i.toString().padStart(3, "0")}`;
        bike.number = i;
        bike.location = "AB1";
        bike.isAvailable = true;
        bike.condition = getRandomCondition();
        bike.lastMaintenance = getRandomMaintenanceDate();
        bike.batteryLevel = 100;
        bike.totalRides = Math.floor(Math.random() * 50);
        bike.rating = parseFloat((Math.random() * 2 + 3).toFixed(1)); // 3.0 to 5.0
        bikes.push(bike);
      }

      await bikeRepository.save(bikes);
      console.log("✅ Successfully initialized 25 bikes at AB1");
    }
  } catch (error) {
    console.error("❌ Error initializing bikes:", error);
  }
};

const getRandomCondition = (): "Excellent" | "Good" | "Fair" => {
  const conditions: ("Excellent" | "Good" | "Fair")[] = [
    "Excellent",
    "Good",
    "Fair",
  ];
  const weights = [0.4, 0.5, 0.1]; // 40% excellent, 50% good, 10% fair

  const random = Math.random();
  if (random < weights[0]) return conditions[0];
  if (random < weights[0] + weights[1]) return conditions[1];
  return conditions[2];
};

const getRandomMaintenanceDate = (): Date => {
  const now = new Date();
  const daysAgo = Math.floor(Math.random() * 30); // 0-30 days ago
  return new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
};
