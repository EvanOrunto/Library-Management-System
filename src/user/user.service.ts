import {
  ConflictException,
  ForbiddenException,
  HttpException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserDocument } from './schema/user.schema';
import * as crypto from 'crypto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel('User') private readonly userModel: Model<UserDocument>,
  ) {}

  async createUser(payload: CreateUserDto) {
    const { email, password, username, department } = payload;

    // Convert username to uppercase
    const uppercaseUsername = username.toUpperCase();

    // Define the allowed email addresses
    const allowedEmails = [
      'Jnguaanguesomo@pvamu.edu',
      'dalonge@pvamu.edu',
      'oalabi4@pvamu.edu',
      'cokafor15@pvamu.edu',
    ];

    // Check if the entered email is in the allowed list
    if (!allowedEmails.includes(email)) {
      throw new ForbiddenException(
        "Sorry, you are not a student here and can't sign up",
      );
    }

    // Find the user with the highest userid
    const highestUser = await this.userModel.findOne().sort('-userid').exec();

    // Calculate the new userid
    let newUserId = 'LT1'; // Initial value
    if (highestUser && highestUser.userid) {
      const lastUserIdNumber = parseInt(highestUser.userid.slice(2)); // Extract the numeric part
      newUserId = `LT${lastUserIdNumber + 1}`;
    }

    // Continue with checking for existing users
    const _user = await this.userModel.find({ email });
    if (_user.length) {
      throw new ConflictException('User with details already exists');
    }

    // Convert username to uppercase for checking
    const __user = await this.userModel.find({ username: uppercaseUsername });
    if (__user.length) {
      throw new ConflictException('User with details already exists');
    }

    const hashPassword = this.hashPassword(password);
    const uploadData = {
      ...payload,
      password: hashPassword,
      username: uppercaseUsername, // Save uppercase username
      userid: newUserId,
    } as User;

    const user = await this.userModel.create(uploadData);
    return user;
  }

  hashPassword(password: string) {
    const hash = crypto.createHash('sha256').update(password).digest('hex');
    return hash;
  }

  async updateUser(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<User | null> {
    const user = await this.userModel
      .findByIdAndUpdate(id, updateUserDto, { new: true })
      .exec();
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async removeUser(id: string): Promise<User | null> {
    const user = await this.userModel.findByIdAndDelete(id).exec();
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findAll(): Promise<User[]> {
    // Sort the books by 'createdAt' field in descending order
    return this.userModel.find().sort({ _id: -1 }).exec();
  }
  async totalUsers() {
    return this.userModel.find().countDocuments().exec();
  }

  async findByName(username: string): Promise<User | null> {
    const user = await this.userModel.findOne({ username }).exec();
    if (!user) {
      throw new NotFoundException(`User with username ${username} not found`);
    }
    return user;
  }

  async findById(id: string): Promise<UserDocument> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async getUserByUsername(identifier: string) {
    let user;

    user = await this.userModel
      .findOne({ username: identifier })
      .orFail(
        new HttpException(
          { message: `Unable to retrieve User with username ${identifier}` },
          400,
        ),
      );

    return user;
  }

  async getUserByEmail(identifier: string) {
    let user;

    user = await this.userModel
      .findOne({ email: identifier })
      .orFail(
        new HttpException(
          { message: `Unable to retrieve User with email ${identifier}` },
          400,
        ),
      );

    return user;
  }

  comparePassword(password: string, storedPasswordHash: string): boolean {
    const hashedPassword = this.hashPassword(password);
    return hashedPassword === storedPasswordHash;
  }
}
