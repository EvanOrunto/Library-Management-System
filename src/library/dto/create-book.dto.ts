import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsString } from 'class-validator';

export class CreateBookDto {
  @IsString()
  @ApiProperty({
    description: 'The title of the book',
    example: 'MAT101',
  })
  title: string;

  @IsString()
  @ApiProperty({
    description: 'The Author of the book',
    example: 'S.A Perry',
  })
  author: string;

  @IsNumber()
  @ApiProperty({
    description: 'The department using the book',
    example: 2,
  })
  total: number;

  @IsString()
  @ApiProperty({
    description: 'The image using the book',
    example: '',
  })
  imageUrl: string;

  @IsBoolean()
  @ApiProperty({
    description: 'The availability of the book',
    example: true,
  })
  available: true;

  @IsString()
  @ApiProperty({
    description: 'The department using the book',
    example: 'Computer Science',
  })
  department: string;
}
