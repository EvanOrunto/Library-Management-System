import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({
    required: false,
    description: 'The new username of the user (optional)',
    example: 'new_username',
  })
  username?: string;

  @ApiProperty({
    required: false,
    description: 'The new password of the user (optional)',
    example: 'new_securePassword123',
  })
  password?: string;
}
