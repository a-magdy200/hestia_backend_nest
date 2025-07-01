import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString } from 'class-validator';

import { UserStatus } from '../../interfaces/enums/user.enum';

/**
 * DTO for changing user status
 */
export class ChangeUserStatusDto {
  @ApiProperty({
    description: 'New status for the user',
    enum: UserStatus,
    example: UserStatus.ACTIVE,
  })
  @IsEnum(UserStatus, { message: 'Status must be a valid user status' })
  status!: UserStatus;

  @ApiProperty({
    description: 'Reason for status change',
    example: 'Account reactivated after verification',
  })
  @IsString({ message: 'Reason must be a string' })
  reason!: string;
}
