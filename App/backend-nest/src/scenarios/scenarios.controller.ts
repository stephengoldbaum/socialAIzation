import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Req,
  Query,
  Put,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ScenariosService, PaginatedResponse } from './scenarios.service';
import { CreateScenarioDto } from './dto/create-scenario.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';
import { Scenario } from './schemas/scenario.schema';
import { ListScenariosQueryDto } from './dto/list-scenarios-query.dto';

// Define custom request type with user property
interface RequestWithUser extends Request {
  user: {
    id: string;
    email: string;
    role: string;
  };
}

@ApiTags('scenarios')
@Controller('scenarios')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ScenariosController {
  constructor(private readonly scenariosService: ScenariosService) {}

  @Post()
  @Roles(UserRole.SCENARIO_OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new scenario' })
  @ApiResponse({ 
    status: HttpStatus.CREATED, 
    description: 'Scenario successfully created',
    type: Scenario
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST, 
    description: 'Invalid input data'
  })
  @ApiResponse({ 
    status: HttpStatus.UNAUTHORIZED, 
    description: 'Unauthorized'
  })
  @ApiResponse({ 
    status: HttpStatus.FORBIDDEN, 
    description: 'Forbidden - requires scenario_owner or admin role'
  })
  async create(
    @Body() createScenarioDto: CreateScenarioDto,
    @Req() req: RequestWithUser,
  ): Promise<Scenario> {
    return this.scenariosService.create(createScenarioDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'List all scenarios with filtering and pagination' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Scenarios successfully retrieved',
  })
  @ApiResponse({ 
    status: HttpStatus.UNAUTHORIZED, 
    description: 'Unauthorized'
  })
  async findAll(
    @Query() queryParams: ListScenariosQueryDto,
    @Req() req: RequestWithUser,
  ): Promise<PaginatedResponse<Scenario>> {
    return this.scenariosService.findAll(queryParams);
  }

  @Get('my-scenarios')
  @ApiOperation({ summary: 'List scenarios created by the current user' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Scenarios successfully retrieved',
  })
  @ApiResponse({ 
    status: HttpStatus.UNAUTHORIZED, 
    description: 'Unauthorized'
  })
  async findMyScenarios(
    @Query() queryParams: ListScenariosQueryDto,
    @Req() req: RequestWithUser,
  ): Promise<PaginatedResponse<Scenario>> {
    return this.scenariosService.findAll(queryParams, req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a scenario by ID' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Scenario successfully retrieved',
    type: Scenario
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Scenario not found'
  })
  @ApiResponse({ 
    status: HttpStatus.UNAUTHORIZED, 
    description: 'Unauthorized'
  })
  async findOne(@Param('id') id: string): Promise<Scenario> {
    return this.scenariosService.findById(id);
  }

  @Put(':id')
  @Roles(UserRole.SCENARIO_OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Update a scenario' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Scenario successfully updated',
    type: Scenario
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Scenario not found'
  })
  @ApiResponse({ 
    status: HttpStatus.UNAUTHORIZED, 
    description: 'Unauthorized'
  })
  @ApiResponse({ 
    status: HttpStatus.FORBIDDEN, 
    description: 'Forbidden - requires scenario_owner or admin role'
  })
  async update(
    @Param('id') id: string,
    @Body() updateScenarioDto: CreateScenarioDto,
    @Req() req: RequestWithUser,
  ): Promise<Scenario> {
    return this.scenariosService.update(id, updateScenarioDto, req.user.id);
  }

  @Delete(':id')
  @Roles(UserRole.SCENARIO_OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete a scenario' })
  @ApiResponse({ 
    status: HttpStatus.NO_CONTENT, 
    description: 'Scenario successfully deleted'
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Scenario not found'
  })
  @ApiResponse({ 
    status: HttpStatus.UNAUTHORIZED, 
    description: 'Unauthorized'
  })
  @ApiResponse({ 
    status: HttpStatus.FORBIDDEN, 
    description: 'Forbidden - requires scenario_owner or admin role'
  })
  async remove(
    @Param('id') id: string,
    @Req() req: RequestWithUser,
  ): Promise<void> {
    return this.scenariosService.remove(id, req.user.id);
  }

  @Post(':id/start')
  @ApiOperation({ summary: 'Start a scenario session' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Session successfully started'
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Scenario not found'
  })
  @ApiResponse({ 
    status: HttpStatus.UNAUTHORIZED, 
    description: 'Unauthorized'
  })
  async startSession(
    @Param('id') id: string,
    @Req() req: RequestWithUser,
  ): Promise<{ scenario: Scenario; session: any; startedAt: Date }> {
    // Get the scenario
    const scenario = await this.scenariosService.findById(id);
    
    if (!scenario) {
      throw new NotFoundException(`Scenario with ID ${id} not found`);
    }
    
    // Create a session object
    // In a real implementation, this would be stored in a sessions collection
    const session = {
      id: `session_${Date.now()}`,
      scenarioId: id,
      userId: req.user.id,
      startedAt: new Date()
    };
    
    return {
      scenario,
      session,
      startedAt: new Date()
    };
  }

  @Post(':id/interaction')
  @ApiOperation({ summary: 'Record a user interaction in a scenario' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Interaction successfully recorded'
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Scenario not found'
  })
  @ApiResponse({ 
    status: HttpStatus.UNAUTHORIZED, 
    description: 'Unauthorized'
  })
  async recordInteraction(
    @Param('id') id: string,
    @Body() interactionData: { sessionId: string; interactionType: string; data?: Record<string, any> },
    @Req() req: RequestWithUser,
  ): Promise<any> {
    // Get the scenario
    const scenario = await this.scenariosService.findById(id);
    
    if (!scenario) {
      throw new NotFoundException(`Scenario with ID ${id} not found`);
    }
    
    // Create an interaction object
    // In a real implementation, this would be stored in an interactions collection
    const interaction = {
      id: `interaction_${Date.now()}`,
      sessionId: interactionData.sessionId,
      type: interactionData.interactionType,
      data: interactionData.data || {},
      timestamp: new Date()
    };
    
    return {
      scenarioId: id,
      sessionId: interactionData.sessionId,
      interaction,
      timestamp: new Date(),
      metrics: [
        { name: 'responseTime', value: Math.floor(Math.random() * 500) + 100 },
        { name: 'accuracy', value: parseFloat((Math.random()).toFixed(2)) }
      ]
    };
  }
}
