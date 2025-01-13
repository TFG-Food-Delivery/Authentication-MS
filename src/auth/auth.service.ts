import {
  HttpStatus,
  Inject,
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaClient } from '@prisma/client';
import { JwtPayloadInterface } from './interfaces/jwt-payload.interface';
import { LoginUserDto, RegisterUserDto, UpdateCustomerUserDto } from './dto';
import * as bcrypt from 'bcrypt';
import { RpcException } from '@nestjs/microservices';
import { envs } from 'src/config';
import { readReplicas } from '@prisma/extension-read-replicas';
import { getAuth } from 'firebase-admin/auth';
import { CurrentUser } from './types/current-user.type';
import {
  CreateCourierDto,
  CreateCustomerDto,
  CreateRestaurantDto,
} from './sagas/dto';
import {
  CreateRestaurantSaga,
  CreateCustomerSaga,
  CreateCourierSaga,
} from './sagas';

@Injectable()
export class AuthService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger('AuthService');
  onModuleInit() {
    // this.$extends(
    //   readReplicas({
    //     url: [envs.follower1DatabaseUrl, envs.follower2DatabaseUrl],
    //   }),
    // );
    this.$connect();
    this.logger.log('Database connected');
  }

  constructor(
    @Inject('create-restaurant-saga')
    private createRestaurantSaga: CreateRestaurantSaga,
    @Inject('create-customer-saga')
    private createCustomerSaga: CreateCustomerSaga,
    @Inject('create-courier-saga') private createCourierSaga: CreateCourierSaga,
    private readonly jwtService: JwtService,
  ) {
    super();
  }

  async signJWT(payload: JwtPayloadInterface) {
    return this.jwtService.sign(payload);
  }

  async registerUser(registerUserDto: RegisterUserDto) {
    const {
      name,
      lastName,
      email,
      password,
      image,
      phoneNumber,
      dateOfBirth,
      role,
    } = registerUserDto;
    const user = await this.findUserByEmail(email, phoneNumber);
    if (user) {
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message:
          user.email === email
            ? `Registration failed. User with email ${email} already exists.`
            : `Registration failed. User with phone ${phoneNumber} already exists.`,
      });
    }

    const newUser = await this.user.create({
      data: {
        name: `${name} ${lastName}`,
        email,
        password: bcrypt.hashSync(password, 10),
        image,
        phoneNumber,
        dateOfBirth,
        role,
      },
    });

    const { id, email: userEmail, name: userName } = newUser;

    return {
      user: {
        id,
        email: userEmail,
        name: userName,
      },
    };
  }

  async login(loginUserDto: LoginUserDto) {
    const { email, password } = loginUserDto;

    const user = await this.findUserByEmail(email);

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

  async findUser(id: string) {
    const user = await this.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: `User with email ${id} doesn't exist.`,
      });
    }
    return user;
  }

  async findUserByEmail(email: string, phoneNumber?: string) {
    const user = await this.user.findFirst({
      where: phoneNumber
        ? {
            OR: [{ email }, { phoneNumber }],
          }
        : { email },
    });

    if (!phoneNumber && !user) {
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: `User with email ${email} doesn't exist.`,
      });
    }

    return user;
  }

  async verifyToken(token: string) {
    try {
      let user: CurrentUser, newToken: string;
      try {
        const { sub, iat, exp, ...userVerified } = await this.jwtService.verify(
          token,
          {
            secret: envs.jwtSecret,
          },
        );
        const foundUser = await this.findUserByEmail(userVerified.email);
        user = {
          id: foundUser.id,
          email: foundUser.email,
          name: foundUser.name,
          image: foundUser.image,
          role: foundUser.role,
        };
        newToken = await this.signJWT(user);
      } catch (JsonWebTokenError) {
        const authFirebase = getAuth();
        const userVerified = await authFirebase.verifyIdToken(token);
        const myUser = await this.findUserByEmail(userVerified.email);
        user = {
          id: userVerified.uid,
          email: userVerified.email,
          name: userVerified.name,
          image: myUser.image,
          role: myUser.role,
        };
        newToken = token;
      }
      console.log(user);
      return {
        user,
        newToken,
      };
    } catch (error) {
      this.logger.error('Error verifying token:', error);
      throw new RpcException({
        status: HttpStatus.UNAUTHORIZED,
        message: 'Invalid token',
      });
    }
  }

  async updateCustomerUser(updateCustomerUserDto: UpdateCustomerUserDto) {
    const { id, user } = updateCustomerUserDto;

    await this.findUser(id);

    this.logger.debug('Customer update:', updateCustomerUserDto);
    return this.user.update({
      where: { id },
      data: {
        image: user.image,
        phoneNumber: user.phoneNumber,
      },
    });
  }

  async deleteUser(email: string) {
    await this.findUserByEmail(email);
    return this.user.delete({ where: { email: email } });
  }

  /* ---------------------------------- SAGAS --------------------------------- */

  async createCourier(createCourierDto: CreateCourierDto) {
    await this.createCourierSaga.execute(createCourierDto);
    const user = await this.findUserByEmail(createCourierDto.user.email);
    return {
      message: 'Courier created',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
        role: user.role,
      },
      token: await this.signJWT(user),
    };
  }
  async createCustomer(createCustomerDto: CreateCustomerDto) {
    await this.createCustomerSaga.execute(createCustomerDto);
    const user = await this.findUserByEmail(createCustomerDto.user.email);
    return {
      message: 'Customer created',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
        role: user.role,
      },
      token: await this.signJWT(user),
    };
  }
  async createRestaurant(createRestaurantDto: CreateRestaurantDto) {
    await this.createRestaurantSaga.execute(createRestaurantDto);
    const user = await this.findUserByEmail(createRestaurantDto.user.email);
    return {
      message: 'Restaurant created',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
        role: user.role,
      },
      token: await this.signJWT(user),
    };
  }
}
