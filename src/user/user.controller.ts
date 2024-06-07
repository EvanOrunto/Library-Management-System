import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './schema/user.schema';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('USERS')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('usersignup')
  async createUser(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.userService.createUser(createUserDto);
  }

  @Get('gettotalusers')
  async getTotalUsers() {
    return this.userService.totalUsers();
  }

  @Get('getallusers')
  async findAll(): Promise<User[]> {
    return this.userService.findAll();
  }

  @Get('getuser/:username')
  async findByName(@Param('username') username: string): Promise<User | null> {
    return this.userService.findByName(username);
  }

  @Get('getuser:id')
  async findById(@Param('id') id: string): Promise<User | null> {
    return this.userService.findById(id);
  }


}
