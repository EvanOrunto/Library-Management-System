import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDTO } from './dto/create-auth.dto';
import { ApiTags } from '@nestjs/swagger';
import { ResetPasswordDTO } from './dto/reset-password.dto';
import { PasswordDTO } from './dto/password.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/login')
  async create(@Body() payload: LoginDTO) {
    const user = await this.authService.validateUser(
      payload.email,
      payload.password,
    );
    const data = this.authService.login(user);
    return data;
  }

  @Post('admin/login')
  async createadmin(@Body() payload: LoginDTO) {
    const admin = await this.authService.validateAdmin(
      payload.email,
      payload.password,
    );
    const data = this.authService.login(admin);
    return data;
  }

  @Get()
  findAll() {
    return this.authService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.authService.findOne(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.authService.remove(+id);
  }

  @Post('request-password-reset')
  async requestPasswordReset(@Body() payload: ResetPasswordDTO): Promise<void> {
    await this.authService.requestPasswordReset(payload);
  }

  @Post('reset-password')
  async resetPassword(@Body() payload: PasswordDTO): Promise<void> {
    await this.authService.resetPassword(payload);
  }
}
