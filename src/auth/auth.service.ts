import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { UserLoginDto } from './dto/user-login.dto';
import { BadRequestException } from '@nestjs/common/exceptions';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { User } from 'src/user/entities/user.entity';
import { UserLoginResponse } from './dto/user-login.response';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(
    username: string,
    password: string,
  ): Promise<any | null> {
    const user = await this.userService.findOne({
      where: {
        email: username,
      },
      select: {
        email: 1,
        password: 1,
      },
    });
    if (user) {
      if (password === user.password) {
        return user._id;
      }
      // const match = await bcrypt.compare(password, user.password);
      // if (match) {
      //   return user._id;
      // }
    }
    return null;
  }
  async login(credentials: UserLoginDto): Promise<UserLoginResponse> {
    const userId = await this.validateUser(
      credentials.email,
      credentials.password,
    );
    if (userId) {
      const payload = { sub: userId };
      return {
        access_token: this.jwtService.sign(payload),
      };
    } else {
      throw new UnauthorizedException();
    }
  }

  async register(createUserDto: CreateUserDto): Promise<UserLoginResponse> {
    const { first_name, last_name, email, password } = createUserDto;
    const existingUser = await this.userService.findOne({ where: { email } });
    if (existingUser) {
      throw new BadRequestException('Email is already taken');
    }

    // Hash the password
    const hashedPassword = password;//await bcrypt.hash(password, 10);

    // Create the user
    const user = new User();
    user.first_name = first_name;
    user.last_name = last_name;
    user.email = email;
    user.password = hashedPassword;

    // Save the user to the database
    try {
      await this.userService.create(user);
      return this.login({
        email,
        password,
      });
    } catch (error) {
      throw new BadRequestException('Error creating user');
    }
  }
}
