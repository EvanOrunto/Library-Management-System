import {
  BadRequestException,
  HttpException,
  Injectable,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { LoginDTO } from './dto/create-auth.dto';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { AdminService } from 'src/admin/admin.service';
import { sendEmail } from 'src/library/utils';
import { ResetPasswordDTO } from './dto/reset-password.dto';
import { PasswordDTO } from './dto/password.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UserService,
    private readonly adminService: AdminService,
    private readonly jwtService: JwtService,
  ) {}

  async login(user: any) {
    if (user === null) {
      throw new HttpException('invalid email or password', 404);
    }
    console.log(user);
    const payload = {
      name: user.username,
      email: user.email,
      sub: user._id,
    };
    return {
      access_token: this.jwtService.sign(payload, { expiresIn: '6h' }),
    };
  }

  async adminLogin(admin: any) {
    if (admin === null) {
      throw new HttpException('invalid username or password', 404);
    }
    const payload = {
      email: admin.email,
      name: admin.username,
      username: admin.phoneNumber,
      sub: admin._id,
    };
    return {
      access_token: this.jwtService.sign(payload, { expiresIn: '6h' }),
    };
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.getUserByEmail(email);
    if (!user) return null;
    const passwordValid = await this.usersService.comparePassword(
      password,
      user.password,
    );
    if (!user) {
      throw new NotAcceptableException('could not find the user');
    }
    if (user && passwordValid) {
      return user;
    }
    return null;
  }

  async validateAdmin(email: string, password: string): Promise<any> {
    const admin = await this.adminService.getAdminByEmail(email);
    if (!admin) return null;
    const passwordValid = await this.usersService.comparePassword(
      password,
      admin.password,
    );
    if (!admin) {
      throw new NotAcceptableException('could not find the admin');
    }
    if (admin && passwordValid) {
      return admin;
    }
    return null;
  }

  findAll() {
    return `This action returns all auth`;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  // update(id: number, updateAuthDto: UpdateAuthDto) {
  //   return `This action updates a #${id} auth`;
  // }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }

  async requestPasswordReset(payload: ResetPasswordDTO): Promise<void> {
    const user = await this.usersService.getUserByEmail(payload.email);
    // const admin = await this.adminService.getAdminByEmail(payload.email);

    if (!user) {
      throw new NotAcceptableException(
        'User or admin not found with the provided email',
      );
    }

    const resetToken = this.generateResetToken(user);

    // Send the reset link to the user's email
    const resetLink = `https://library-system-5whr-6qtk6t4k4-giverwave.vercel.app/authentication/ResetPassword?token=${resetToken}`;
    await sendEmail(payload.email, 'Password reset', resetLink);
  }

  async resetPassword(payload: PasswordDTO): Promise<void> {
    const decodedToken = this.jwtService.verify(payload.token);
    const user = await this.usersService.findById(decodedToken.sub);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Validate the token type (you can include this in the token payload as well)
    if (decodedToken.type !== 'reset') {
      throw new BadRequestException('Invalid token type');
    }

    // Update the user's password
    user.password = await this.usersService.hashPassword(payload.newPassword);
    await user.save();
  }

  // hashPassword(password: string) {
  //   const hash = crypto.createHash('sha256').update(password).digest('hex');
  //   return hash;
  // }

  private generateResetToken(user: any): string {
    const payload = {
      sub: user._id,
      type: 'reset',
    };
    return this.jwtService.sign(payload, { expiresIn: '1h' });
  }
}
