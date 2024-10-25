import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    UseGuards,
    UploadedFile,
    UseInterceptors,
    HttpCode,
    HttpStatus,
    Request,
    Query,
  } from '@nestjs/common';
  import { MoviesService } from './movies.service';
  import { Movie } from './movie.entity';
  import { JwtAuthGuard } from '../auth/jwt-auth.guard';
  import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes, ApiBody, ApiResponse, ApiQuery } from '@nestjs/swagger';
  import { FileInterceptor } from '@nestjs/platform-express';
  import { diskStorage } from 'multer';
  import { extname } from 'path';
  
  @ApiTags('movies')
  @ApiBearerAuth('access-token') // Matches the name set in Swagger setup
  @UseGuards(JwtAuthGuard) // Apply JWT guard to protect all routes
  @Controller('movies')
  export class MoviesController {
    constructor(private readonly moviesService: MoviesService) {}
  
    // Get all movies
    @Get()
    @ApiOperation({ summary: 'Get user-specific movies with pagination' })
    @ApiQuery({ name: 'page', required: false, example: 1, description: 'Page number' })
    @ApiQuery({ name: 'limit', required: false, example: 10, description: 'Number of movies per page' })
    async findAll(
      @Request() req,
      @Query('page') page: number = 1,
      @Query('limit') limit: number = 10,
    ) {
      const user = req.user; // User is attached to the request object by JwtAuthGuard
      return this.moviesService.findAll(user, page, limit);
    }
  
    // Get a single movie by ID
    @Get(':id')
    @ApiOperation({ summary: 'Get a movie by ID' })
    @ApiResponse({ status: 200, description: 'Movie found.' })
    @ApiResponse({ status: 404, description: 'Movie not found.' })
    async findOne(@Param('id') id: number): Promise<Movie> {
      return this.moviesService.findOne(id);
    }
  
    // Create a new movie with a poster
    @Post()
    @UseInterceptors(
      FileInterceptor('poster', {
        storage: diskStorage({
          destination: './uploads',
          filename: (req, file, callback) => {
            const uniqueName = `${Date.now()}${extname(file.originalname)}`;
            callback(null, uniqueName);
          },
        }),
      }),
    )
    @ApiOperation({ summary: 'Create a new movie with a poster' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
      schema: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          publishingYear: { type: 'number' },
          poster: { type: 'string', format: 'binary' },
        },
      },
    })
    @ApiResponse({ status: 201, description: 'Movie created successfully.' })
    async create(
      @Body() movieData: Partial<Movie>,
      @UploadedFile() file: Express.Multer.File,
    ): Promise<Movie> {
      if (file) {
        movieData.poster = file.filename; // Save the uploaded file's name
      }
      return this.moviesService.create(movieData);
    }
  
    // Update an existing movie by ID
    @Put(':id')
    @ApiOperation({ summary: 'Update a movie' })
    @ApiResponse({ status: 200, description: 'Movie updated successfully.' })
    @ApiResponse({ status: 404, description: 'Movie not found.' })
    async update(
      @Param('id') id: number,
      @Body() movieData: Partial<Movie>,
    ): Promise<Movie> {
      return this.moviesService.update(id, movieData);
    }
  
    // Delete a movie by ID
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Delete a movie' })
    @ApiResponse({ status: 204, description: 'Movie deleted successfully.' })
    @ApiResponse({ status: 404, description: 'Movie not found.' })
    async remove(@Param('id') id: number): Promise<void> {
      return this.moviesService.remove(id);
    }
  }
  