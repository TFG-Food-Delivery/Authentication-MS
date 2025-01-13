import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { catchError, firstValueFrom } from 'rxjs';
import { NATS_SERVICE } from 'src/config';
import { Step } from '../../step';
import { CreateCustomerDto } from '../../dto/create-customer.dto';

@Injectable()
export class CreateCustomerUserStep extends Step<any, void> {
  private readonly LOGGER = new Logger('CreateUserStep');
  constructor(@Inject(NATS_SERVICE) private readonly client: ClientProxy) {
    super();
    this.name = 'Create User Step';
  }

  async invoke(
    registerUserDto: CreateCustomerDto,
    context: { userId?: string },
  ): Promise<void> {
    this.LOGGER.log(`Creating user: ${registerUserDto.user.email}`);
    try {
      // Llamamos al microservicio para crear el usuario
      const { user } = await firstValueFrom(
        this.client.send('authRegisterUser', registerUserDto.user),
      );
      context.userId = user.id;
    } catch (err) {
      this.LOGGER.error(
        `Error in CreateCustomerUserStep while creating user: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err.message); // Lanzamos el error con el mensaje original
    }
  }

  async withCompensation(
    registerUserDto: CreateCustomerDto,
    context: { userId?: string },
  ): Promise<void> {
    this.LOGGER.log(
      `Rolling back user creation: ${registerUserDto.user.email}`,
    );
    await firstValueFrom(
      this.client.send('authDeleteUser', context.userId).pipe(
        catchError((err) => {
          throw new RpcException(err);
        }),
      ),
    );
  }
}
