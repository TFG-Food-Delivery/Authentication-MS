import { Inject, Injectable, Logger } from '@nestjs/common';
import { Step } from '../step';
import { CreateRestaurantDto } from '../dto';
import { CreateRestaurantStep, CreateRestaurantUserStep } from './steps';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class CreateRestaurantSaga {
  private readonly LOGGER = new Logger('CreateRestaurantSaga');
  private steps: Step<CreateRestaurantDto, void>[] = [];
  private successfulSteps: Step<CreateRestaurantDto, void>[] = [];

  constructor(
    @Inject('create-restaurant-user-step') step1: CreateRestaurantUserStep,
    @Inject('create-restaurant-step') step2: CreateRestaurantStep,
  ) {
    this.steps = [step1, step2];
  }

  async execute(createRestaurantDto: CreateRestaurantDto) {
    const context: { userId?: string } = {};

    for (let step of this.steps) {
      try {
        this.LOGGER.log(`Invoking: ${step.name} ...`);
        await step.invoke(createRestaurantDto, context);
        this.LOGGER.log('Successfully shifted');
        this.successfulSteps.unshift(step);
      } catch (error) {
        this.LOGGER.error(`Failed Step: ${step.name} !!`);
        this.successfulSteps.forEach(async (s) => {
          this.LOGGER.log(`Rolling back: ${s.name} ...`);
          await s.withCompensation(createRestaurantDto, context);
        });
        throw new RpcException(
          error.message || 'Error in CreateRestaurantSaga',
        );
      }
    }
    this.LOGGER.log('Restaurant Creation Successful');
  }
}
