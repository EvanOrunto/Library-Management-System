import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { LocalStrategy } from './local.auth';
import { PassportModule } from '@nestjs/passport';
import { UserModule } from '../user/user.module';
import { AdminModule } from 'src/admin/admin.module';


@Module({
  imports: [
    UserModule,
    AdminModule,
    PassportModule,
    JwtModule.register({
      secret: 'worldisfullofdevelopers',
      signOptions: { expiresIn: 3600 },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, LocalStrategy],
})
export class AuthModule {}
