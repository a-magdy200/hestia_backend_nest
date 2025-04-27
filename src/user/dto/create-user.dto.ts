// import { IsString, IsEmail, MinLength, MaxLength } from 'class-validator';

export class CreateUserDto {
  // @IsString()
  // @MinLength(2)
  // @MaxLength(30)
  first_name: string;

  // @IsString()
  // @MinLength(2)
  // @MaxLength(30)
  last_name: string;

  // @IsString()
  // @IsEmail()
  email: string;

  // @IsString()
  // @MinLength(8)
  // @MaxLength(20)
  password: string;
}
