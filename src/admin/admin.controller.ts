import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  Delete,
} from '@nestjs/common';

import { ApiTags } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { Admin } from './schema/admin.schema';
import { CreateAdminDto } from './dto/create-admin.dto';

@ApiTags('ADMIN')
@Controller('admins')
export class AdminController {
  constructor(private readonly adminservice: AdminService) {}

  @Post('adminignup')
  async createUser(@Body() crateAdminDto: CreateAdminDto): Promise<Admin> {
    return this.adminservice.createAdmin(crateAdminDto);
  }

  @Get('gettotaladmin')
  async getTotalAdmin() {
    return this.adminservice.totalAdmin();
  }

  @Get('getalladmin')
  async findAll(): Promise<Admin[]> {
    return this.adminservice.findAll();
  }

  @Get('getadmin/:username')
  async findByName(@Param('username') username: string): Promise<Admin | null> {
    return this.adminservice.findByName(username);
  }

  @Get('getadmin:id')
  async findById(@Param('id') id: string): Promise<Admin | null> {
    return this.adminservice.findById(id);
  }


}
