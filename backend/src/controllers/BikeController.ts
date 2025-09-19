import { Request, Response } from "express";
import { AppDataSource } from "../config/database";
import { Bike } from "../entities/Bike";

export class BikeController {
  private bikeRepository = AppDataSource.getRepository(Bike);

  // Get all bikes
  async getAllBikes(req: Request, res: Response) {
    try {
      const bikes = await this.bikeRepository.find();

      // Convert to object format matching frontend expectation
      const bikesObject = bikes.reduce((acc, bike) => {
        acc[bike.id] = bike;
        return acc;
      }, {} as any);

      res.json({
        success: true,
        bikes: bikesObject,
      });
    } catch (error) {
      console.error("Get all bikes error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Get available bikes at a location
  async getAvailableBikes(req: Request, res: Response) {
    try {
      const { location } = req.params;

      const bikes = await this.bikeRepository.find({
        where: {
          location: location,
          isAvailable: true,
        },
      });

      res.json({
        success: true,
        bikes,
      });
    } catch (error) {
      console.error("Get available bikes error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Get bike by ID
  async getBikeById(req: Request, res: Response) {
    try {
      const { bikeId } = req.params;

      const bike = await this.bikeRepository.findOne({ where: { id: bikeId } });
      if (!bike) {
        return res.status(404).json({
          success: false,
          message: "Bike not found",
        });
      }

      res.json({
        success: true,
        bike,
      });
    } catch (error) {
      console.error("Get bike by ID error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Book a bike
  async bookBike(req: Request, res: Response) {
    try {
      const { bikeId } = req.params;
      const { userId } = req.body;

      const bike = await this.bikeRepository.findOne({ where: { id: bikeId } });
      if (!bike) {
        return res.status(404).json({
          success: false,
          message: "Bike not found",
        });
      }

      if (!bike.isAvailable) {
        return res.status(400).json({
          success: false,
          message: "Bike not available",
        });
      }

      // Book the bike
      bike.isAvailable = false;
      bike.currentUser = userId;
      bike.bookedAt = new Date();

      await this.bikeRepository.save(bike);

      res.json({
        success: true,
        bike,
      });
    } catch (error) {
      console.error("Book bike error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Return a bike
  async returnBike(req: Request, res: Response) {
    try {
      const { bikeId } = req.params;
      const { newLocation, condition } = req.body;

      const bike = await this.bikeRepository.findOne({ where: { id: bikeId } });
      if (!bike) {
        return res.status(404).json({
          success: false,
          message: "Bike not found",
        });
      }

      // Return the bike
      bike.isAvailable = true;
      bike.location = newLocation;
      //@ts-ignore
      bike.currentUser = null;
      //@ts-ignore
      bike.bookedAt = null;
      bike.returnedAt = new Date();
      bike.totalRides += 1;

      if (condition) {
        bike.condition = condition;
      }

      await this.bikeRepository.save(bike);

      res.json({
        success: true,
        bike,
      });
    } catch (error) {
      console.error("Return bike error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Get bike stats
  async getBikeStats(req: Request, res: Response) {
    try {
      const totalBikes = await this.bikeRepository.count();
      const availableBikes = await this.bikeRepository.count({
        where: { isAvailable: true },
      });
      const busyBikes = totalBikes - availableBikes;

      // Get bikes by location
      const bikesByLocation = await this.bikeRepository
        .createQueryBuilder("bike")
        .select("bike.location", "location")
        .addSelect("COUNT(*)", "count")
        .addSelect(
          "SUM(CASE WHEN bike.isAvailable = true THEN 1 ELSE 0 END)",
          "available"
        )
        .groupBy("bike.location")
        .getRawMany();

      res.json({
        success: true,
        stats: {
          totalBikes,
          availableBikes,
          busyBikes,
          bikesByLocation,
        },
      });
    } catch (error) {
      console.error("Get bike stats error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
}
