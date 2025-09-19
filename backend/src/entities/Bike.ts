import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { Ride } from "./Ride";

@Entity("bikes")
export class Bike {
  @PrimaryColumn()
  id!: string;

  @Column()
  number!: number;

  @Column()
  location!: string;

  @Column({ default: true })
  isAvailable!: boolean;

  @Column({
    type: "enum",
    enum: ["Excellent", "Good", "Fair"],
    default: "Good",
  })
  condition!: "Excellent" | "Good" | "Fair";

  @Column({ type: "timestamp" })
  lastMaintenance!: Date;

  @Column({ default: 100 })
  batteryLevel!: number;

  @Column({ default: 0 })
  totalRides!: number;

  @Column({ type: "decimal", precision: 2, scale: 1, default: 5.0 })
  rating!: number;

  @Column({ nullable: true })
  currentUser?: string;

  @Column({ type: "timestamp", nullable: true })
  bookedAt?: Date;

  @Column({ type: "timestamp", nullable: true })
  returnedAt?: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @OneToMany(() => Ride, (ride) => ride.bike)
  rides!: Ride[];
}
