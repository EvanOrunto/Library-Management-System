import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import {
  Injectable,
  NotAcceptableException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { NotFoundException } from '@nestjs/common';
import { User } from '../user/schema/user.schema';




@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'user') {
  constructor(private authService: AuthService) {
    super({ usernameField: 'username' });
  }

  async validate(username: string, password: string): Promise<User> {
    const user = await this.authService.validateUser(username, password);
    if (!user) {
      throw new NotFoundException('could not find the user');
    }
    return user;
  }
}