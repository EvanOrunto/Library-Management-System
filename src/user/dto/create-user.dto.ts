import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @ApiProperty({
    description: 'The username of the user',
    example: 'john_doe',
  })
  username: string;

  @IsString()
  @ApiProperty({
    description: 'The email of the user',
    example: 'john@jhsfh.com',
  })
  email: string;

  @IsString()
  @ApiProperty({
    description: 'The department of the user',
    example: 'Computer Science',
  })
  department: string;

  @IsString()
  @ApiProperty({
    description: 'The password of the user',
    example: 'securePassword123',
  })
  password: string;

}
