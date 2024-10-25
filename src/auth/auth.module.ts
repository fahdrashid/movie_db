import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    UsersModule,  // Import other required modules here
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,  // Set your JWT secret
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [AuthController],  // Declare controllers only here
  providers: [AuthService, JwtStrategy],  // Declare providers here
  exports: [AuthService, JwtModule],  // Export only necessary services/modules
})
export class AuthModule {}
