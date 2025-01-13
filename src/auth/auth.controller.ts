import { Controller, ParseUUIDPipe } from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { AuthService } from './auth.service';
import { LoginUserDto, RegisterUserDto, UpdateCustomerUserDto } from './dto';
import { CreateRestaurantDto } from './sagas/dto/create-restaurant.dto';
import { CreateCustomerDto } from './sagas/dto/create-customer.dto';
import { CreateCourierDto } from './sagas/dto/create-courier.dto';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern('authRegisterUser')
  registerUser(@Payload() registerUserDto: RegisterUserDto) {
    return this.authService.registerUser(registerUserDto);
  }

  @MessagePattern('createRestaurantSaga')
  createRestaurant(@Payload() createRestaurantDto: CreateRestaurantDto) {
    return this.authService.createRestaurant(createRestaurantDto);
  }
  @MessagePattern('createCustomerSaga')
  createCustomer(@Payload() createCustomerDto: CreateCustomerDto) {
    return this.authService.createCustomer(createCustomerDto);
  }
  @MessagePattern('createCourierSaga')
  createCourier(@Payload() createCourierDto: CreateCourierDto) {
    return this.authService.createCourier(createCourierDto);
  }

  @MessagePattern('authLoginUser')
  loginUser(@Payload() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @MessagePattern('findUser')
  findUser(@Payload('id', ParseUUIDPipe) id: string) {
    return this.authService.findUser(id);
  }

  @MessagePattern('checkUserExists')
  checkUserExists(@Payload() payload: { email: string; phone: string }) {
    return this.authService.findUserByEmail(payload.email, payload.phone);
  }

  @MessagePattern('authVerifyUser')
  verifyToken(@Payload() token: string) {
    return this.authService.verifyToken(token);
  }

  @EventPattern('updateCustomer')
  updateCustomer(@Payload() updateUserDto: UpdateCustomerUserDto) {
    return this.authService.updateCustomerUser(updateUserDto);
  }

  @MessagePattern('authDeleteUser')
  deleteUser(@Payload() email: string) {
    return this.authService.deleteUser(email);
  }
}
