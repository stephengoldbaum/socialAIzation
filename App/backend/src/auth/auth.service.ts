import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { ConfigService } from '../config';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './strategies/jwt.strategy';
import { JwtRefreshPayload } from './strategies/jwt-refresh.strategy';
import { User, UserRole } from '../users/schemas/user.schema';
import { CreateUserDto } from '../users/dto/create-user.dto';

/**
 * Authentication response interface
 */
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
  };
  expiresIn: number;
}

/**
 * Authentication service
 * Implements strict security with fail-fast approach
 */
@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  /**
   * Register a new user
   * @param createUserDto User creation data
   * @returns Authentication response with tokens
   */
  async register(createUserDto: CreateUserDto): Promise<AuthResponse> {
    // Create the user
    const user = await this.usersService.create(createUserDto);
    
    // Generate tokens
    const tokens = await this.generateTokens(user);
    
    // Store refresh token
    await this.storeRefreshToken(user.id, tokens.refreshToken);
    
    // Update last login
    await this.usersService.updateLastLogin(user.id);
    
    // Return auth response
    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      expiresIn: this.getAccessTokenExpiryInSeconds(),
    };
  }

  /**
   * Login a user
   * @param loginDto Login credentials
   * @returns Authentication response with tokens
   * @throws UnauthorizedException if credentials are invalid
   */
  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const { email, password } = loginDto;
    
    // Find user by email
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    
    // Verify password
    const isPasswordValid = await this.verifyPassword(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    
    // Generate tokens
    const tokens = await this.generateTokens(user);
    
    // Store refresh token
    await this.storeRefreshToken(user.id, tokens.refreshToken);
    
    // Update last login
    await this.usersService.updateLastLogin(user.id);
    
    // Return auth response
    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      expiresIn: this.getAccessTokenExpiryInSeconds(),
    };
  }

  /**
   * Refresh access token using refresh token
   * @param userId User ID from JWT payload
   * @param refreshToken Refresh token
   * @returns New access token and refresh token
   */
  async refreshTokens(userId: string): Promise<{ accessToken: string; refreshToken: string; expiresIn: number }> {
    // Find user
    const user = await this.usersService.findById(userId);
    
    // Generate new tokens
    const tokens = await this.generateTokens(user);
    
    // Store new refresh token
    await this.storeRefreshToken(user.id, tokens.refreshToken);
    
    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: this.getAccessTokenExpiryInSeconds(),
    };
  }

  /**
   * Logout a user by invalidating their refresh token
   * @param userId User ID
   */
  async logout(userId: string): Promise<void> {
    // Clear refresh token
    await this.usersService.updateRefreshToken(userId, null);
  }

  /**
   * Generate access and refresh tokens for a user
   * @param user User object
   * @returns Access and refresh tokens
   */
  private async generateTokens(user: User): Promise<{ accessToken: string; refreshToken: string }> {
    // Create access token payload
    const accessTokenPayload: Omit<JwtPayload, 'iat' | 'exp'> = {
      sub: user.id,
      email: user.email,
      role: user.role,
      tokenType: 'access',
    };
    
    // Create refresh token payload
    const refreshTokenPayload: Omit<JwtRefreshPayload, 'iat' | 'exp'> = {
      sub: user.id,
      email: user.email,
      tokenType: 'refresh',
    };
    
    // Generate tokens
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(accessTokenPayload, {
        secret: this.configService.jwtSecret,
        expiresIn: this.configService.jwtExpiry,
      }),
      this.jwtService.signAsync(refreshTokenPayload, {
        secret: this.configService.jwtRefreshSecret,
        expiresIn: this.configService.jwtRefreshExpiry,
      }),
    ]);
    
    return { accessToken, refreshToken };
  }

  /**
   * Store refresh token in user record (hashed)
   * @param userId User ID
   * @param refreshToken Refresh token
   */
  private async storeRefreshToken(userId: string, refreshToken: string): Promise<void> {
    // Hash the refresh token before storing
    const salt = await bcrypt.genSalt(10);
    const hashedRefreshToken = await bcrypt.hash(refreshToken, salt);
    
    // Update user's refresh token
    await this.usersService.updateRefreshToken(userId, hashedRefreshToken);
  }

  /**
   * Verify a password against a hash
   * @param plainPassword Plain text password
   * @param hashedPassword Hashed password
   * @returns True if password matches
   */
  private async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  /**
   * Get access token expiry in seconds
   * @returns Expiry in seconds
   */
  private getAccessTokenExpiryInSeconds(): number {
    const expiryString = this.configService.jwtExpiry;
    
    // Parse expiry string (e.g., '1h', '30m')
    if (expiryString.endsWith('h')) {
      return parseInt(expiryString) * 60 * 60;
    } else if (expiryString.endsWith('m')) {
      return parseInt(expiryString) * 60;
    } else if (expiryString.endsWith('s')) {
      return parseInt(expiryString);
    } else if (expiryString.endsWith('d')) {
      return parseInt(expiryString) * 24 * 60 * 60;
    } else {
      // Default to seconds if no unit specified
      return parseInt(expiryString);
    }
  }
}
