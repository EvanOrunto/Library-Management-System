import {
  ConflictException,
  ForbiddenException,
  HttpException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { Admin } from './schema/admin.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as crypto from 'crypto';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel('Admin') private readonly adminModel: Model<Admin>,
  ) {}

  async createAdmin(payload: CreateAdminDto) {
    const { email, password, username } = payload;

    // Define the allowed email addresses
    const allowedEmails = ['sakinwa@pvamu.edu'];

    // Check if the entered email is in the allowed list
    if (!allowedEmails.includes(email)) {
      throw new ForbiddenException(
        "Sorry, you are not an admin here and can't sign up",
      );
    }

    // Continue with checking for existing admins
    const _admin = await this.adminModel.find({ email });
    if (_admin.length) {
      throw new ConflictException('Admin with details already exists');
    }
    const __admin = await this.adminModel.find({ username });
    if (__admin.length) {
      throw new ConflictException('Admin with details already exists');
    }

    const hashPassword = this.hashPassword(password);
    const uploadData = { ...payload, password: hashPassword } as Admin;
    const user = await this.adminModel.create(uploadData);
    return user;
  }

  hashPassword(password: string) {
    const hash = crypto.createHash('sha256').update(password).digest('hex');
    return hash;
  }

  async findAll(): Promise<Admin[]> {
    // Sort the books by 'createdAt' field in descending order
    return this.adminModel.find().sort({ _id: -1 }).exec();
  }
  async totalAdmin() {
    return this.adminModel.find().countDocuments().exec();
  }

  async findByName(username: string): Promise<Admin | null> {
    const admin = await this.adminModel.findOne({ username }).exec();
    if (!admin) {
      throw new NotFoundException(`Admin with username ${username} not found`);
    }
    return admin;
  }

  async findById(id: string): Promise<Admin | null> {
    const admin = await this.adminModel.findById(id).exec();
    if (!admin) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return admin;
  }

  async getAdminByUsername(identifier: string) {
    let admin;

    admin = await this.adminModel
      .findOne({ username: identifier })
      .orFail(
        new HttpException(
          { message: `Unable to retrieve Admin with username ${identifier}` },
          400,
        ),
      );

    return admin;
  }

  async getAdminByEmail(identifier: string) {
    let admin;

    admin = await this.adminModel
      .findOne({ email: identifier })
      .orFail(
        new HttpException(
          { message: `Unable to retrieve Admin with email ${identifier}` },
          400,
        ),
      );

    return admin;
  }
}
