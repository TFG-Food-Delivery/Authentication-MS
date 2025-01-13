import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { catchError, firstValueFrom } from 'rxjs';
import { NATS_SERVICE } from 'src/config';
import { Step } from '../../step';
import { CreateRestaurantDto } from '../../dto/create-restaurant.dto';

@Injectable()
export class CreateRestaurantUserStep extends Step<any, void> {
  private readonly LOGGER = new Logger('CreateUserStep');
  constructor(@Inject(NATS_SERVICE) private readonly client: ClientProxy) {
    super();
    this.name = 'Create User Step';
  }

  async invoke(
    registerUserDto: CreateRestaurantDto,
    context: { userId?: string },
  ): Promise<any> {
    this.LOGGER.log(`Creating user: ${registerUserDto.user.email}`);
    try {
      const { user } = await firstValueFrom(
        this.client.send('authRegisterUser', registerUserDto.user),
      );
      context.userId = user.id;
    } catch (err) {
      this.LOGGER.error(
        `Error in CreateRestaurantUserStep while creating user: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err.message); // Lanzamos el error con el mensaje original
    }
  }

  async withCompensation(
    registerUserDto: CreateRestaurantDto,
    context: { userId?: string },
  ): Promise<void> {
    const { email } = registerUserDto.user;
    this.LOGGER.log(`Rolling back user creation: ${email}`);
    await firstValueFrom(
      this.client.send('authDeleteUser', context.userId).pipe(
        catchError((err) => {
          throw new RpcException(err);
        }),
      ),
    );
  }
}
