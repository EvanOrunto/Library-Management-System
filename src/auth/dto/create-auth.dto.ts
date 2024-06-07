import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class LoginDTO {
  @ApiProperty({ default: 'asadd@pvamu.com', required: true })
  @IsNotEmpty()
  email: string;

  @ApiProperty({ default: 'Testpassword1234', required: true })
  @IsNotEmpty()
  password: string;
}

