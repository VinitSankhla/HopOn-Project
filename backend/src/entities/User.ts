import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { Ride } from "./Ride";

@Entity("users")
export class User {
  @PrimaryColumn()
  id!: string;

  @Column()
  name!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  phone!: string;

  @Column()
  gender!: string;

  @Column()
  password!: string;

  @Column({ default: 0 })
  totalRides!: number;

  @Column({ type: "jsonb", nullable: true })
  profile!: {
    avatar?: string;
    preferences: {
      notifications: boolean;
      theme: string;
    };
  };

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @OneToMany(() => Ride, (ride) => ride.user)
  rides!: Ride[];

  // Method to generate unique user ID
  static generateUserId(): string {
    return "USER_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
  }

  // Method to exclude password from response
  toJSON() {
    const { password, ...userWithoutPassword } = this;
    return userWithoutPassword;
  }
}
