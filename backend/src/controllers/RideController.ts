import { Request, Response } from "express";
import { AppDataSource } from "../config/database";
import { Ride } from "../entities/Ride";
import { User } from "../entities/User";
import { Bike } from "../entities/Bike";

export class RideController {
  private rideRepository = AppDataSource.getRepository(Ride);
  private userRepository = AppDataSource.getRepository(User);
  private bikeRepository = AppDataSource.getRepository(Bike);

  // Create a new ride
  async createRide(req: Request, res: Response) {
    try {
      const { userId, bikeId, startLocation, endLocation, timerDuration } =
        req.body;

      // Check if user exists
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Check if bike exists and is available
      const bike = await this.bikeRepository.findOne({ where: { id: bikeId } });
      if (!bike) {
        return res.status(404).json({
          success: false,
          message: "Bike not found",
        });
      }

      // if (!bike.isAvailable) {
      //     return res.status(400).json({
      //         success: false,
      //         message: "Bike not available"
      //     });
      // }

      // Create new ride
      const ride = new Ride();
      ride.userId = userId;
      ride.bikeId = bikeId;
      ride.startLocation = startLocation;
      ride.endLocation = endLocation;
      ride.timerDuration = timerDuration || 15;
      ride.status = "active";
      ride.cost = 0;

      await this.rideRepository.save(ride);

      // Book the bike
      bike.isAvailable = false;
      bike.currentUser = userId;
      bike.bookedAt = new Date();
      await this.bikeRepository.save(bike);

      res.status(201).json({
        success: true,
        ride,
      });
    } catch (error) {
      console.error("Create ride error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Get all rides
  async getAllRides(req: Request, res: Response) {
    try {
      const rides = await this.rideRepository.find({
        order: { startTime: "DESC" },
      });

      res.json({
        success: true,
        rides,
      });
    } catch (error) {
      console.error("Get all rides error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Get rides by user ID
  async getUserRides(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      const rides = await this.rideRepository.find({
        where: { userId },
        order: { startTime: "DESC" },
      });

      res.json({
        success: true,
        rides,
      });
    } catch (error) {
      console.error("Get user rides error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Get active ride for user
  async getActiveRide(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      const ride = await this.rideRepository.findOne({
        where: { userId, status: "active" },
      });

      res.json({
        success: true,
        ride,
      });
    } catch (error) {
      console.error("Get active ride error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Complete a ride
  async completeRide(req: Request, res: Response) {
    try {
      const { rideId } = req.params;
      const { endLocation, rating, feedback } = req.body;

      const ride = await this.rideRepository.findOne({ where: { id: rideId } });
      if (!ride) {
        return res.status(404).json({
          success: false,
          message: "Ride not found",
        });
      }

      if (ride.status !== "active") {
        return res.status(400).json({
          success: false,
          message: "Ride is not active",
        });
      }

      // Complete the ride
      ride.endTime = new Date();
      ride.status = "completed";
      ride.endLocation = endLocation;
      ride.actualDuration = Ride.calculateDuration(
        ride.startTime,
        ride.endTime
      );
      ride.rating = rating || null;
      ride.feedback = feedback || null;

      await this.rideRepository.save(ride);

      // Return the bike
      const bike = await this.bikeRepository.findOne({
        where: { id: ride.bikeId },
      });
      if (bike) {
        bike.isAvailable = true;
        bike.location = endLocation;
        //@ts-ignore
        bike.currentUser = null;
        //@ts-ignore
        bike.bookedAt = null;
        bike.returnedAt = new Date();
        bike.totalRides += 1;
        await this.bikeRepository.save(bike);
      }

      // Update user stats
      const user = await this.userRepository.findOne({
        where: { id: ride.userId },
      });
      if (user) {
        user.totalRides += 1;
        await this.userRepository.save(user);
      }

      res.json({
        success: true,
        ride,
      });
    } catch (error) {
      console.error("Complete ride error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Cancel a ride
  async cancelRide(req: Request, res: Response) {
    try {
      const { rideId } = req.params;

      const ride = await this.rideRepository.findOne({ where: { id: rideId } });
      if (!ride) {
        return res.status(404).json({
          success: false,
          message: "Ride not found",
        });
      }

      if (ride.status !== "active") {
        return res.status(400).json({
          success: false,
          message: "Ride is not active",
        });
      }

      // Cancel the ride
      ride.status = "cancelled";
      ride.endTime = new Date();
      await this.rideRepository.save(ride);

      // Return the bike
      const bike = await this.bikeRepository.findOne({
        where: { id: ride.bikeId },
      });
      if (bike) {
        bike.isAvailable = true;
        //@ts-ignore
        bike.currentUser = null;
        //@ts-ignore
        bike.bookedAt = null;
        await this.bikeRepository.save(bike);
      }

      res.json({
        success: true,
        ride,
      });
    } catch (error) {
      console.error("Cancel ride error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Get ride statistics
  async getRideStats(req: Request, res: Response) {
    try {
      const totalRides = await this.rideRepository.count();
      const activeRides = await this.rideRepository.count({
        where: { status: "active" },
      });
      const completedRides = await this.rideRepository.count({
        where: { status: "completed" },
      });

      // Get popular routes
      const popularRoutes = await this.rideRepository
        .createQueryBuilder("ride")
        .select("ride.startLocation", "startLocation")
        .addSelect("ride.endLocation", "endLocation")
        .addSelect("COUNT(*)", "count")
        .where("ride.status = :status", { status: "completed" })
        .groupBy("ride.startLocation, ride.endLocation")
        .orderBy("count", "DESC")
        .limit(5)
        .getRawMany();

      res.json({
        success: true,
        stats: {
          totalRides,
          activeRides,
          completedRides,
          popularRoutes,
        },
      });
    } catch (error) {
      console.error("Get ride stats error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
}
