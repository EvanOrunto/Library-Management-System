import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ResetPasswordDTO {
  @ApiProperty({ default: 'asadd@pvamu.com', required: true })
  @IsNotEmpty()
  @IsString()
  email: string;
}

