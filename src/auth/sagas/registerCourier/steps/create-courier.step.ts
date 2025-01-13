import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { NATS_SERVICE } from 'src/config';
import { Step } from '../../step';
import { catchError, firstValueFrom } from 'rxjs';
import { CreateCourierDto } from '../../dto';

@Injectable()
export class CreateCourierStep extends Step<any, void> {
  private readonly LOGGER = new Logger('CreateCourierStep');
  constructor(@Inject(NATS_SERVICE) private readonly client: ClientProxy) {
    super();
    this.name = 'Create Courier Step';
  }

  async invoke(
    createCourierDto: CreateCourierDto,
    context: { userId?: string },
  ): Promise<any> {
    this.LOGGER.log(
      `Creating courier for user: ${createCourierDto.user.email}`,
    );

    const { user, ...rest } = createCourierDto;

    await firstValueFrom(
      this.client
        .send('createCourier', {
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
    createCourierDto: CreateCourierDto,
    context: { userId?: string },
  ): Promise<void> {
    this.LOGGER.log(
      `Rolling back specialization for user: ${createCourierDto.user.email}`,
    );
    await firstValueFrom(
      this.client
        .send('deleteCourier', {
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
