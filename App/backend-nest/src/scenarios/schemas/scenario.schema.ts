import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { ApiProperty } from '@nestjs/swagger';

export enum MediaType {
  VR = 'VR',
  WEB = 'web',
  MOBILE = 'mobile',
}

@Schema({
  timestamps: true,
  toJSON: {
    transform: (_, ret) => {
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  },
})
export class Scenario extends Document {
  @ApiProperty({ description: 'Unique identifier', example: 'a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6' })
  @Prop({ type: String, default: () => uuidv4() })
  id!: string;

  @ApiProperty({ description: 'Scenario name', example: 'Job Interview Practice' })
  @Prop({ required: true })
  name!: string;

  @ApiProperty({ description: 'Scenario description', example: 'Practice for a job interview in a safe environment' })
  @Prop({ required: true })
  description!: string;

  @ApiProperty({ enum: MediaType, description: 'Media type', example: MediaType.VR })
  @Prop({ type: String, enum: Object.values(MediaType), required: true })
  mediaType!: MediaType;

  @ApiProperty({ description: 'User ID who created the scenario' })
  @Prop({ required: true, type: String })
  createdBy!: string;

  @ApiProperty({ description: 'Creation date' })
  @Prop()
  createdAt!: Date;

  @ApiProperty({ description: 'Last update date' })
  @Prop()
  updatedAt!: Date;
}

export const ScenarioSchema = SchemaFactory.createForClass(Scenario);

// Add indexes
ScenarioSchema.index({ id: 1 }, { unique: true });
ScenarioSchema.index({ name: 1 });
ScenarioSchema.index({ createdBy: 1 });
ScenarioSchema.index({ mediaType: 1 });
