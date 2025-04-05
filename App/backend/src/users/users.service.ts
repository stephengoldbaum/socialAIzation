import { Injectable, NotFoundException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcryptjs';
import { MongoError } from 'mongodb';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  /**
   * Find a user by email
   * @param email User email
   * @returns User or null if not found
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }

  /**
   * Find a user by ID
   * @param id User ID
   * @returns User or throws NotFoundException
   */
  async findById(id: string): Promise<User> {
    const user = await this.userModel.findOne({ id }).exec();
    
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    
    return user;
  }

  /**
   * Create a new user
   * @param createUserDto User creation data
   * @returns Created user
   * @throws ConflictException if email already exists
   */
  async create(createUserDto: CreateUserDto): Promise<User> {
    const { email, password } = createUserDto;
    
    // Check if user with this email already exists
    const existingUser = await this.findByEmail(email);
    if (existingUser) {
      throw new ConflictException(`User with email ${email} already exists`);
    }
    
    // Hash password
    const hashedPassword = await this.hashPassword(password);
    
    // Create new user
    try {
      const newUser = new this.userModel({
        ...createUserDto,
        password: hashedPassword,
      });
      
      return await newUser.save();
    } catch (error) {
      // Handle potential database errors
      if (error instanceof MongoError && error.code === 11000) {
        throw new ConflictException(`User with email ${email} already exists`);
      }
      throw new InternalServerErrorException('Failed to create user');
    }
  }

  /**
   * Update user's refresh token
   * @param userId User ID
   * @param refreshToken Hashed refresh token or null to clear
   */
  async updateRefreshToken(userId: string, refreshToken: string | null): Promise<void> {
    const user = await this.findById(userId);
    
    // Handle null case separately to avoid type error
    if (refreshToken === null) {
      user.refreshToken = undefined;
      user.lastLogin = undefined;
    } else {
      user.refreshToken = refreshToken;
    }
    
    await user.save();
  }

  /**
   * Update user's last login time
   * @param userId User ID
   */
  async updateLastLogin(userId: string): Promise<void> {
    const user = await this.findById(userId);
    
    user.lastLogin = new Date();
    await user.save();
  }

  /**
   * Hash a password
   * @param password Plain text password
   * @returns Hashed password
   */
  private async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }
}
