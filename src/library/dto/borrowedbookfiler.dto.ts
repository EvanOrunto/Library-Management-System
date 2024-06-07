// borrowed-books-filter.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsBoolean, IsDateString } from 'class-validator';

export class BorrowedBooksFilterDto {
  @ApiProperty({ required: false })
  @IsOptional()
  overdue?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  returned?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  returnDate?: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  borrowDate?: Date;
}
