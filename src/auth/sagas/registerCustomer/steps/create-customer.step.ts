import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { NATS_SERVICE } from 'src/config';
import { Step } from '../../step';
import { catchError, firstValueFrom } from 'rxjs';
import { CreateCustomerDto } from '../../dto/create-customer.dto';

@Injectable()
export class CreateCustomerStep extends Step<any, void> {
  private readonly LOGGER = new Logger('CreateCustomerStep');
  constructor(@Inject(NATS_SERVICE) private readonly client: ClientProxy) {
    super();
    this.name = 'Create Customer Step';
  }

  async invoke(
    createCustomerDto: CreateCustomerDto,
    context: { userId?: string },
  ): Promise<any> {
    if (!context.userId) {
      throw new RpcException('UserId is required to create a customer');
    }

    this.LOGGER.log(
      `Creating customer for user: ${createCustomerDto.user.email}`,
    );
    const { user, ...rest } = createCustomerDto;
    await firstValueFrom(
      this.client
        .send('createCustomer', {
          ...rest,
          id: context.userId,
          email: user.email,
        })
        .pipe(
          catchError((err) => {
            throw new RpcException(err);
          }),
        ),
    );
  }

  async withCompensation(
    createCustomerDto: CreateCustomerDto,
    context: { userId?: string },
  ): Promise<void> {
    this.LOGGER.log(
      `Rolling back specialization for user: ${createCustomerDto.user.email}`,
    );
    await firstValueFrom(
      this.client
        .send('deleteCustomer', {
          id: context.userId,
        })
        .pipe(
          catchError((err) => {
            throw new RpcException(err);
          }),
        ),
    );
  }
}
