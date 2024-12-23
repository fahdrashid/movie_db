import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Movie } from './movie.entity';
import { User } from 'src/users/user.entity';

@Injectable()
export class MoviesService {
  constructor(
    @InjectRepository(Movie)
    private readonly moviesRepository: Repository<Movie>,
  ) {}

  // Get all movies
  async findAll(user: User, page: number, limit: number): Promise<Movie[]> {
    const skip = (page - 1) * limit;
    return this.moviesRepository.find({
      where: { user: { id: user.id } },
      skip: skip,
      take: limit,
    });
  }

  // Get a single movie by ID
  async findOne(id: number): Promise<Movie> {
    const movie = await this.moviesRepository.findOne({ where: { id } });
    if (!movie) {
      throw new NotFoundException(`Movie with ID ${id} not found`);
    }
    return movie;
  }

  // Create a new movie
  async create(movieData: Partial<Movie>, user: User): Promise<Movie> {
    const movie = this.moviesRepository.create({
      ...movieData,
      user,  // Associate the movie with the user
    });
    return this.moviesRepository.save(movie);
  }

  // Update a movie by ID
  async update(id: number, movieData: Partial<Movie>): Promise<Movie> {
    try {
      // Check if the movie exists
      const movie = await this.findOne(id);
      if (!movie) {
        throw new NotFoundException(`Movie with ID ${id} not found`);
      }

      // Merge the existing data with the new data
      Object.assign(movie, movieData);

      // Save the updated movie
      return await this.moviesRepository.save(movie);
    } catch (error) {
      console.error('Error updating movie:', error); // Log the error for debugging
      throw new InternalServerErrorException('Failed to update the movie');
    }
  }

  // Delete a movie
  async remove(id: number): Promise<void> {
    const result = await this.moviesRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Movie with ID ${id} not found`);
    }
  }
}
