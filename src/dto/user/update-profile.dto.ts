import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsUrl,
  IsDateString,
  IsObject,
  MaxLength,
  Matches,
  IsUUID,
} from 'class-validator';

/**
 * DTO for updating a user profile
 */
export class UpdateProfileDto {
  @ApiPropertyOptional({
    description: 'User first name',
    example: 'John',
    maxLength: 50,
  })
  @IsOptional()
  @IsString({ message: 'First name must be a string' })
  @MaxLength(50, { message: 'First name must not exceed 50 characters' })
  @Matches(/^[a-zA-Z\s'-]+$/, { message: 'First name contains invalid characters' })
  firstName?: string;

  @ApiPropertyOptional({
    description: 'User last name',
    example: 'Doe',
    maxLength: 50,
  })
  @IsOptional()
  @IsString({ message: 'Last name must be a string' })
  @MaxLength(50, { message: 'Last name must not exceed 50 characters' })
  @Matches(/^[a-zA-Z\s'-]+$/, { message: 'Last name contains invalid characters' })
  lastName?: string;

  @ApiPropertyOptional({
    description: 'User display name',
    example: 'John Doe',
    maxLength: 100,
  })
  @IsOptional()
  @IsString({ message: 'Display name must be a string' })
  @MaxLength(100, { message: 'Display name must not exceed 100 characters' })
  displayName?: string;

  @ApiPropertyOptional({
    description: 'User bio or description',
    example: 'Passionate chef and food enthusiast',
    maxLength: 500,
  })
  @IsOptional()
  @IsString({ message: 'Bio must be a string' })
  @MaxLength(500, { message: 'Bio must not exceed 500 characters' })
  bio?: string;

  @ApiPropertyOptional({
    description: 'User avatar URL',
    example: 'https://example.com/avatar.jpg',
  })
  @IsOptional()
  @IsUrl({}, { message: 'Avatar URL must be a valid URL' })
  avatarUrl?: string;

  @ApiPropertyOptional({
    description: 'User date of birth',
    example: '1990-01-01',
  })
  @IsOptional()
  @IsDateString({}, { message: 'Date of birth must be a valid date string' })
  dateOfBirth?: string;

  @ApiPropertyOptional({
    description: 'User phone number',
    example: '+1234567890',
    maxLength: 20,
  })
  @IsOptional()
  @IsString({ message: 'Phone number must be a string' })
  @MaxLength(20, { message: 'Phone number must not exceed 20 characters' })
  @Matches(/^\+?[\d\s\-()]+$/, { message: 'Phone number contains invalid characters' })
  phoneNumber?: string;

  @ApiPropertyOptional({
    description: 'User location',
    example: 'New York, NY',
    maxLength: 100,
  })
  @IsOptional()
  @IsString({ message: 'Location must be a string' })
  @MaxLength(100, { message: 'Location must not exceed 100 characters' })
  location?: string;

  @ApiPropertyOptional({
    description: 'User website URL',
    example: 'https://johndoe.com',
  })
  @IsOptional()
  @IsUrl({}, { message: 'Website URL must be a valid URL' })
  website?: string;

  @ApiPropertyOptional({
    description: 'User preferences as JSON object',
    example: { theme: 'dark', language: 'en', notifications: true },
  })
  @IsOptional()
  @IsObject({ message: 'Preferences must be an object' })
  preferences?: Record<string, unknown>;

  @ApiPropertyOptional({
    description: 'User social media links',
    example: { twitter: 'https://twitter.com/johndoe', instagram: 'https://instagram.com/johndoe' },
  })
  @IsOptional()
  @IsObject({ message: 'Social links must be an object' })
  socialLinks?: Record<string, string>;

  @ApiPropertyOptional({
    description: 'Tenant ID for multi-tenant architecture',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID('4', { message: 'Tenant ID must be a valid UUID' })
  tenantId?: string;
}
