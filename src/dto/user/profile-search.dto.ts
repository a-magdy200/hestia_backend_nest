import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, IsBoolean } from 'class-validator';

/**
 * DTO for user profile search criteria
 */
export class ProfileSearchDto {
  @ApiPropertyOptional({
    description: 'Search term for name, bio, or location',
    example: 'chef',
  })
  @IsOptional()
  @IsString({ message: 'Search term must be a string' })
  searchTerm?: string;

  @ApiPropertyOptional({
    description: 'Filter by first name',
    example: 'John',
  })
  @IsOptional()
  @IsString({ message: 'First name must be a string' })
  firstName?: string;

  @ApiPropertyOptional({
    description: 'Filter by last name',
    example: 'Doe',
  })
  @IsOptional()
  @IsString({ message: 'Last name must be a string' })
  lastName?: string;

  @ApiPropertyOptional({
    description: 'Filter by location',
    example: 'New York',
  })
  @IsOptional()
  @IsString({ message: 'Location must be a string' })
  location?: string;

  @ApiPropertyOptional({
    description: 'Filter by user ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID('4', { message: 'User ID must be a valid UUID' })
  userId?: string;

  @ApiPropertyOptional({
    description: 'Filter by tenant ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID('4', { message: 'Tenant ID must be a valid UUID' })
  tenantId?: string;

  @ApiPropertyOptional({
    description: 'Filter by profile completion status',
  })
  @IsOptional()
  @IsBoolean({ message: 'Is complete must be a boolean' })
  isComplete?: boolean;

  @ApiPropertyOptional({
    description: 'Filter by profiles with avatars',
  })
  @IsOptional()
  @IsBoolean({ message: 'Has avatar must be a boolean' })
  hasAvatar?: boolean;
}
