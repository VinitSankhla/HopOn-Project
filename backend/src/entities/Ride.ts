import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  BeforeInsert,
} from "typeorm";
import { User } from "./User";
import { Bike } from "./Bike";

@Entity("rides")
export class Ride {
  @PrimaryColumn()
  id!: string;

  @Column()
  userId!: string;

  @Column()
  bikeId!: string;

  @Column()
  startLocation!: string;

  @Column()
  endLocation!: string;

  @Column({ type: "timestamp" })
  startTime!: Date;

  @Column({ type: "timestamp", nullable: true })
  endTime?: Date;

  @Column({
    type: "enum",
    enum: ["active", "completed", "cancelled"],
    default: "active",
  })
  status!: "active" | "completed" | "cancelled";

  @Column({ default: 15 })
  timerDuration!: number; // in minutes

  @Column({ nullable: true })
  actualDuration?: number; // in minutes

  @Column({ type: "decimal", precision: 2, scale: 1, nullable: true })
  rating?: number;

  @Column({ type: "text", nullable: true })
  feedback?: string;

  @Column({ default: 0 })
  cost!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @ManyToOne(() => User, (user) => user.rides)
  @JoinColumn({ name: "userId" })
  user!: User;

  @ManyToOne(() => Bike, (bike) => bike.rides)
  @JoinColumn({ name: "bikeId" })
  bike!: Bike;

  @BeforeInsert()
  generateId() {
    if (!this.id) {
      this.id =
        "RIDE_" + Date.now() + "_" + Math.random().toString(36).substr(2, 6);
    }
    if (!this.startTime) {
      this.startTime = new Date();
    }
  }

  // Method to calculate duration between two timestamps
  static calculateDuration(startTime: Date, endTime: Date): number {
    return Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60)); // in minutes
  }
}
