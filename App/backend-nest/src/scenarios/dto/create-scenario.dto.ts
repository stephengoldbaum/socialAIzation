import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { MediaType } from '../schemas/scenario.schema';

/**
 * DTO for scenario creation with strict validation
 * All fields are required with no default values
 */
export class CreateScenarioDto {
  @ApiProperty({
    description: 'Scenario name',
    example: 'Job Interview Practice',
  })
  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  @MinLength(1, { message: 'Name must not be empty' })
  name!: string;

  @ApiProperty({
    description: 'Scenario description',
    example: 'Practice for a job interview in a safe environment',
  })
  @IsString()
  @IsNotEmpty({ message: 'Description is required' })
  @MinLength(1, { message: 'Description must not be empty' })
  description!: string;

  @ApiProperty({
    description: 'Media type',
    enum: MediaType,
    example: MediaType.VR,
  })
  @IsEnum(MediaType, { message: 'Invalid media type. Must be one of: VR, web, mobile' })
  @IsNotEmpty({ message: 'Media type is required' })
  mediaType!: MediaType;
}
