import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SearchBooksDto {
  @IsString()
  @IsOptional()
  @ApiProperty({ required: false, description: 'Title of the book' })
  title: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false, description: 'Department of the book' })
  department: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false, description: 'Author of the book' })
  author: string;
}
