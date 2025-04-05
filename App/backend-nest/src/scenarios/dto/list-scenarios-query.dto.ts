import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { MediaType } from '../schemas/scenario.schema';

export enum SortField {
  NAME = 'name',
  CREATED_AT = 'createdAt',
  MEDIA_TYPE = 'mediaType',
}

export enum SortDirection {
  ASC = 'asc',
  DESC = 'desc',
}

/**
 * DTO for scenario listing query parameters with strict validation
 * Implements fail-fast validation with no default values in the DTO itself
 */
export class ListScenariosQueryDto {
  @ApiProperty({
    description: 'Page number (1-based)',
    example: 1,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Page must be an integer' })
  @Min(1, { message: 'Page must be at least 1' })
  page?: number;

  @ApiProperty({
    description: 'Number of items per page',
    example: 10,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Page size must be an integer' })
  @Min(1, { message: 'Page size must be at least 1' })
  pageSize?: number;

  @ApiProperty({
    description: 'Media type filter',
    enum: MediaType,
    required: false,
  })
  @IsOptional()
  @IsEnum(MediaType, { message: 'Invalid media type. Must be one of: VR, web, mobile' })
  mediaType?: MediaType;

  @ApiProperty({
    description: 'Search term for name and description',
    example: 'interview',
    required: false,
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    description: 'Field to sort by',
    enum: SortField,
    required: false,
  })
  @IsOptional()
  @IsEnum(SortField, { message: 'Invalid sort field. Must be one of: name, createdAt, mediaType' })
  sortField?: SortField;

  @ApiProperty({
    description: 'Sort direction',
    enum: SortDirection,
    required: false,
  })
  @IsOptional()
  @IsEnum(SortDirection, { message: 'Invalid sort direction. Must be one of: asc, desc' })
  sortDirection?: SortDirection;
}
