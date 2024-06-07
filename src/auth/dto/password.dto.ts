import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class PasswordDTO {


  @ApiProperty({})
  @IsNotEmpty()
  @IsString()
  token: string;

  @ApiProperty({})
  @IsNotEmpty()
  @IsString()
  newPassword: string;
}
