import { Injectable } from '@nestjs/common';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserDocument } from './entities/user.entity';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, ProjectionType, QueryOptions } from 'mongoose';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly model: Model<UserDocument>,
  ) {}

  async create(createUserDto: Partial<User>): Promise<User> {
    return await this.model.create(createUserDto);
  }

  findAll(
    filter: FilterQuery<User>,
    projection?: ProjectionType<User>,
    options?: QueryOptions<User>,
  ): Promise<User[]> {
    return this.model.find(filter, projection, options);
  }

  findOne(
    filter: FilterQuery<User>,
    projection?: ProjectionType<User>,
    options?: QueryOptions<User>,
  ): Promise<User|null> {
    return this.model.findOne(filter, projection, options);
  }

  findOneById(id: string): Promise<User|null> {
    return this.model.findById(id);
  }

  async updateOne(id: string, updateUserDto: UpdateUserDto): Promise<User|null> {
    return this.model.findByIdAndUpdate(id, updateUserDto);
  }

  async remove(id: string): Promise<boolean> {
    await this.model.findByIdAndDelete(id);
    return true;
  }
}
