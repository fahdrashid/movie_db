import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../users/users.service';
import { JwtPayload } from './jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'process.env.JWT_SECRET',
    });
  }

  // Validate the JWT payload and attach the user to the request
  async validate(payload: JwtPayload) {
    const user = await this.usersService.findByEmail(payload.sub);  // Find the user by ID
    if (!user) {
      throw new UnauthorizedException();  // Throw error if user not found
    }
    return user;  // Attach user to the request
  }
}
