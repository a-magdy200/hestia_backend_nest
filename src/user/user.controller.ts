import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  UnauthorizedException,
  Put, HttpCode, HttpStatus,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.userService.findAll({});
  }

  @Get('profile')
  @HttpCode(HttpStatus.OK)
  profile(@Request() req: Request & { user: { userId: string } }) {
    console.log({ req });
    const userId = req?.user?.userId;
    if (userId) {
      return this.userService.findOneById(userId);
    }
    throw new UnauthorizedException();
  }

  @Put('profile')
  async updateProfile(
    @Request() req: Request & { user: { userId: string } },
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const userId = req?.user?.userId;
    if (userId) {
      const user = await this.userService.findOneById(userId);
      if (user) {
        return this.userService.updateOne(userId, updateUserDto);
      }
    }
    throw new UnauthorizedException();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOneById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.updateOne(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}
