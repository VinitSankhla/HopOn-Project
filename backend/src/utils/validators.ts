import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsPhoneNumber,
  IsOptional,
  IsEnum,
  IsNumber,
  Min,
  Max,
} from "class-validator";

export class RegisterUserDto {
  @IsNotEmpty()
  @IsString()
  loginId!: string;

  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsEmail()
  email!: string;

  @IsNotEmpty()
  @IsString()
  phone!: string;

  @IsNotEmpty()
  @MinLength(6)
  password!: string;
}

export class LoginUserDto {
  @IsNotEmpty()
  @IsString()
  loginId!: string;

  @IsNotEmpty()
  @IsString()
  password!: string;
}

export class CreateRideDto {
  @IsNotEmpty()
  @IsString()
  userId!: string;

  @IsNotEmpty()
  @IsString()
  bikeId!: string;

  @IsNotEmpty()
  @IsString()
  startLocation!: string;

  @IsNotEmpty()
  @IsString()
  endLocation!: string;

  @IsOptional()
  @IsNumber()
  @Min(5)
  @Max(120)
  timerDuration?: number;
}

export class CompleteRideDto {
  @IsNotEmpty()
  @IsString()
  endLocation!: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  rating?: number;

  @IsOptional()
  @IsString()
  feedback?: string;
}

export class BookBikeDto {
  @IsNotEmpty()
  @IsString()
  userId!: string;
}

export class ReturnBikeDto {
  @IsNotEmpty()
  @IsString()
  newLocation!: string;

  @IsOptional()
  @IsEnum(["Excellent", "Good", "Fair"])
  condition?: "Excellent" | "Good" | "Fair";
}
