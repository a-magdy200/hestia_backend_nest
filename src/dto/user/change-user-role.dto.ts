import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString } from 'class-validator';

import { UserRole } from '../../interfaces/enums/user.enum';

/**
 * DTO for changing user role
 */
export class ChangeUserRoleDto {
  @ApiProperty({
    description: 'New role for the user',
    enum: UserRole,
    example: UserRole.ADMIN,
  })
  @IsEnum(UserRole, { message: 'Role must be a valid user role' })
  role!: UserRole;

  @ApiProperty({
    description: 'Reason for role change',
    example: 'Promoted to admin for system management',
  })
  @IsString({ message: 'Reason must be a string' })
  reason!: string;
}
