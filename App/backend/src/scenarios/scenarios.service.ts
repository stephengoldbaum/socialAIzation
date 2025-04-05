import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Scenario, MediaType } from './schemas/scenario.schema';
import { CreateScenarioDto } from './dto/create-scenario.dto';
import { ListScenariosQueryDto, SortDirection, SortField } from './dto/list-scenarios-query.dto';

/**
 * Interface for pagination response
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Interface for scenario filter options
 */
export interface ScenarioFilter {
  mediaType?: MediaType;
  search?: string;
  createdBy?: string;
}

/**
 * Interface for scenario sort options
 */
export interface ScenarioSort {
  field: string;
  direction: SortDirection;
}

@Injectable()
export class ScenariosService {
  private readonly logger = new Logger(ScenariosService.name);

  constructor(
    @InjectModel(Scenario.name) private readonly scenarioModel: Model<Scenario>,
  ) {}

  /**
   * Create a new scenario
   * @param createScenarioDto Scenario creation data
   * @param userId User ID of the creator
   * @returns Created scenario
   */
  async create(createScenarioDto: CreateScenarioDto, userId: string): Promise<Scenario> {
    this.logger.log(`Creating scenario for user ${userId}`);
    
    const scenario = new this.scenarioModel({
      ...createScenarioDto,
      createdBy: userId,
    });
    
    const savedScenario = await scenario.save();
    this.logger.log(`Scenario created with ID: ${savedScenario.id}`);
    
    return savedScenario;
  }

  /**
   * Get a scenario by ID
   * @param id Scenario ID
   * @returns Scenario or throws NotFoundException
   */
  async findById(id: string): Promise<Scenario> {
    const scenario = await this.scenarioModel.findOne({ id }).exec();
    
    if (!scenario) {
      this.logger.warn(`Scenario not found with ID: ${id}`);
      throw new NotFoundException(`Scenario with ID ${id} not found`);
    }
    
    return scenario;
  }

  /**
   * List scenarios with filtering, sorting, and pagination
   * @param queryParams Query parameters for filtering, sorting, and pagination
   * @param userId User ID to filter by (optional)
   * @returns Paginated response of scenarios
   */
  async findAll(
    queryParams: ListScenariosQueryDto,
    userId?: string,
  ): Promise<PaginatedResponse<Scenario>> {
    // Set default values if not provided
    const page = queryParams.page || 1;
    const pageSize = queryParams.pageSize || 10;
    
    // Build filter
    const filter: ScenarioFilter = {};
    
    // Add user filter if provided
    if (userId) {
      filter.createdBy = userId;
    }
    
    // Add media type filter if provided
    if (queryParams.mediaType) {
      filter.mediaType = queryParams.mediaType;
    }
    
    // Add search filter if provided
    if (queryParams.search) {
      filter.search = queryParams.search;
    }
    
    // Build sort
    const sort: ScenarioSort = {
      field: queryParams.sortField || SortField.CREATED_AT,
      direction: queryParams.sortDirection || SortDirection.DESC,
    };
    
    // Execute query
    const scenarios = await this.getScenarios(filter, sort, page, pageSize);
    
    this.logger.log(`Retrieved ${scenarios.items.length} scenarios (page ${page})`);
    
    return scenarios;
  }

  /**
   * Get scenarios with filtering, sorting, and pagination
   * @param filter Filter options
   * @param sort Sort options
   * @param page Page number (1-based)
   * @param pageSize Number of items per page
   * @returns Paginated response of scenarios
   */
  private async getScenarios(
    filter: ScenarioFilter,
    sort: ScenarioSort,
    page: number,
    pageSize: number,
  ): Promise<PaginatedResponse<Scenario>> {
    // Build MongoDB query
    const query: any = {};
    
    // Apply media type filter
    if (filter.mediaType) {
      query.mediaType = filter.mediaType;
    }
    
    // Apply user filter
    if (filter.createdBy) {
      query.createdBy = filter.createdBy;
    }
    
    // Apply search filter
    if (filter.search) {
      query.$or = [
        { name: { $regex: filter.search, $options: 'i' } },
        { description: { $regex: filter.search, $options: 'i' } },
      ];
    }
    
    // Build sort query
    const sortQuery: any = {};
    sortQuery[sort.field] = sort.direction === SortDirection.ASC ? 1 : -1;
    
    // Calculate pagination
    const skip = (page - 1) * pageSize;
    
    // Execute queries
    const [scenarios, total] = await Promise.all([
      this.scenarioModel
        .find(query)
        .sort(sortQuery)
        .skip(skip)
        .limit(pageSize)
        .exec(),
      this.scenarioModel.countDocuments(query).exec(),
    ]);
    
    // Calculate total pages
    const totalPages = Math.ceil(total / pageSize);
    
    // Return paginated response
    return {
      items: scenarios,
      total,
      page,
      pageSize,
      totalPages,
    };
  }

  /**
   * Update a scenario
   * @param id Scenario ID
   * @param updateScenarioDto Scenario update data
   * @param userId User ID of the updater (for authorization)
   * @returns Updated scenario
   */
  async update(
    id: string,
    updateScenarioDto: CreateScenarioDto,
    userId: string,
  ): Promise<Scenario> {
    // Find scenario
    const scenario = await this.findById(id);
    
    // Check if user is the creator
    if (scenario.createdBy !== userId) {
      this.logger.warn(`User ${userId} attempted to update scenario ${id} created by ${scenario.createdBy}`);
      throw new NotFoundException(`Scenario with ID ${id} not found`);
    }
    
    // Update scenario
    Object.assign(scenario, updateScenarioDto);
    
    // Save and return updated scenario
    const updatedScenario = await scenario.save();
    this.logger.log(`Scenario ${id} updated by user ${userId}`);
    
    return updatedScenario;
  }

  /**
   * Delete a scenario
   * @param id Scenario ID
   * @param userId User ID of the deleter (for authorization)
   */
  async remove(id: string, userId: string): Promise<void> {
    // Find scenario
    const scenario = await this.findById(id);
    
    // Check if user is the creator
    if (scenario.createdBy !== userId) {
      this.logger.warn(`User ${userId} attempted to delete scenario ${id} created by ${scenario.createdBy}`);
      throw new NotFoundException(`Scenario with ID ${id} not found`);
    }
    
    // Delete scenario
    await this.scenarioModel.deleteOne({ id }).exec();
    this.logger.log(`Scenario ${id} deleted by user ${userId}`);
  }
}
