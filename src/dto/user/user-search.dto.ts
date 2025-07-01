import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsEnum,
  IsBoolean,
  IsDateString,
  IsNumber,
  Min,
  Max,
  IsUUID,
} from 'class-validator';
import { Transform } from 'class-transformer';

import { UserRole, UserStatus } from '../../interfaces/enums/user.enum';

/**
 * DTO for user search criteria
 */
export class UserSearchDto {
  @ApiProperty({ description: 'Search by email', required: false })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiProperty({ description: 'Filter by role', required: false, enum: UserRole })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiProperty({ description: 'Filter by status', required: false, enum: UserStatus })
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @ApiProperty({ description: 'Tenant ID filter', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsOptional()
  @IsUUID('4', { message: 'Tenant ID must be a valid UUID' })
  tenantId?: string;

  @ApiProperty({ description: 'Filter by email verification status', required: false })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  emailVerified?: boolean;

  @ApiProperty({ description: 'Filter by active status', required: false })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isActive?: boolean;

  @ApiProperty({
    description: 'Filter by creation date (after)',
    example: '2024-01-01T00:00:00Z',
    type: String,
  })
  @IsOptional()
  @IsDateString({}, { message: 'Created after must be a valid date' })
  createdAfter?: string;

  @ApiProperty({
    description: 'Filter by creation date (before)',
    example: '2024-12-31T23:59:59Z',
    type: String,
  })
  @IsOptional()
  @IsDateString({}, { message: 'Created before must be a valid date' })
  createdBefore?: string;

  @ApiProperty({
    description: 'Filter by last login date (after)',
    example: '2024-01-01T00:00:00Z',
    type: String,
  })
  @IsOptional()
  @IsDateString({}, { message: 'Last login after must be a valid date' })
  lastLoginAfter?: string;

  @ApiProperty({
    description: 'Filter by last login date (before)',
    example: '2024-12-31T23:59:59Z',
    type: String,
  })
  @IsOptional()
  @IsDateString({}, { message: 'Last login before must be a valid date' })
  lastLoginBefore?: string;

  @ApiProperty({ description: 'Sort field', example: 'createdAt', type: String })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiProperty({ description: 'Sort order', example: 'DESC', type: String })
  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC';

  @ApiProperty({ description: 'Page number', example: 1, type: Number })
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number;

  @ApiProperty({ description: 'Items per page', example: 10, type: Number })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  @Transform(({ value }) => parseInt(value))
  limit?: number;
}
