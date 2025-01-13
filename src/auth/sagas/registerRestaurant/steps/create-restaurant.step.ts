import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';

import { Step } from '../../step';
import { catchError, firstValueFrom } from 'rxjs';
import { CreateRestaurantDto } from '../../dto/create-restaurant.dto';
import { NATS_SERVICE } from 'src/config';

@Injectable()
export class CreateRestaurantStep extends Step<any, void> {
  private readonly LOGGER = new Logger('CreateRestaurantStep');
  constructor(@Inject(NATS_SERVICE) private readonly client: ClientProxy) {
    super();
    this.name = 'Create Restaurant Step';
  }

  async invoke(
    createRestaurantDto: CreateRestaurantDto,
    context: { userId?: string },
  ): Promise<any> {
    if (!context.userId) {
      throw new RpcException('UserId is required to create a customer');
    }

    this.LOGGER.log(
      `Creating restaurant for user: ${createRestaurantDto.user.email}`,
    );
    const { user, ...rest } = createRestaurantDto;
    const formData = {
      ...rest,
      id: context.userId,
      email: user.email,
      cuisineType: rest.cuisineType.replaceAll(' ', ''),
    };

    await firstValueFrom(
      this.client.send('createRestaurant', formData).pipe(
        catchError((err) => {
          throw new RpcException(err);
        }),
      ),
    );
  }

  async withCompensation(
    createRestaurantDto: CreateRestaurantDto,
    context: { userId?: string },
  ): Promise<void> {
    this.LOGGER.log(
      `Rolling back specialization for user: ${createRestaurantDto.user.email}`,
    );
    await firstValueFrom(
      this.client.send('deleteRestaurant', {
        id: context.userId,
      }),
    ).catch((err) => {
      throw new RpcException(err);
    });
  }
}
