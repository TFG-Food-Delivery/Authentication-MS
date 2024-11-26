import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaClient } from '@prisma/client';
import { JwtPayloadInterface } from './interfaces/jwt-payload.interface';
import { LoginUserDto, RegisterUserDto } from './dto';
import * as bcrypt from 'bcrypt';
import { RpcException } from '@nestjs/microservices';
import { envs } from 'src/config';
import { readReplicas } from '@prisma/extension-read-replicas';

@Injectable()
export class AuthService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger('AuthService');
  onModuleInit() {
    this.$extends(
      readReplicas({
        url: [envs.follower1DatabaseUrl, envs.follower2DatabaseUrl],
      }),
    );
    this.$connect();
    this.logger.log('Database connected');
  }

  constructor(private readonly jwtService: JwtService) {
    super();
  }

  async signJWT(payload: JwtPayloadInterface) {
    return this.jwtService.sign(payload);
  }

  async registerUser(registerUserDto: RegisterUserDto) {
    const { name, email, password, image, phoneNumber, role } = registerUserDto;

    const user = await this.user.findUnique({
      where: { email },
    });

    if (user) {
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: 'User with this email already registered',
      });
    }

    const newUser = await this.user.create({
      data: {
        name,
        email,
        password: bcrypt.hashSync(password, 10),
        image,
        phoneNumber,
        role,
      },
    });

    const { password: __, ...rest } = newUser;

    return {
      user: rest,
      token: await this.signJWT(rest),
    };
  }

  async login(loginUserDto: LoginUserDto) {
    const { email, password } = loginUserDto;

    const user = await this.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: 'Invalid credentials.',
      });
    }

    const isPasswordValid = bcrypt.compareSync(password, user.password);

    if (!isPasswordValid) {
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: 'User/Password not valid.',
      });
    }

    const { password: __, createdAt, updatedAt, ...rest } = user;

    return {
      user: rest,
      token: await this.signJWT(rest),
    };
  }

  async verifyToken(token: string) {
    try {
      const { sub, iat, exp, ...user } = this.jwtService.verify(token, {
        secret: envs.jwtSecret,
      });

      return {
        user: user,
        token: await this.signJWT(user),
      };
    } catch (error) {
      throw new RpcException({
        status: HttpStatus.UNAUTHORIZED,
        message: 'Invalid token',
      });
    }
  }
}
