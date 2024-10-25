import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MoviesModule } from './movies/movies.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { Movie } from './movies/movie.entity';
import { User } from './users/user.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),  // Set the directory path
      serveRoot: '/uploads',  // URL prefix to access the files
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule, Movie, User],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get<string>('DATABASE_URL'),
        autoLoadEntities: true,
        synchronize: true, // set to false in production
      }),
    }),
    MoviesModule, // Ensure MoviesModule is imported here
    UsersModule,
    AuthModule,
  ],
})
export class AppModule {}
