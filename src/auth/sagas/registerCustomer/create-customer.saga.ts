import { Inject, Injectable, Logger } from '@nestjs/common';
import { Step } from '../step';
import { CreateCustomerDto } from '../dto';
import { CreateCustomerStep, CreateCustomerUserStep } from './steps';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class CreateCustomerSaga {
  private readonly LOGGER = new Logger('CreateCustomerSaga');
  private steps: Step<CreateCustomerDto, void>[] = [];
  private successfulSteps: Step<CreateCustomerDto, void>[] = [];

  constructor(
    @Inject('create-customer-user-step') step1: CreateCustomerUserStep,
    @Inject('create-customer-step') step2: CreateCustomerStep,
  ) {
    this.steps = [step1, step2];
  }

  async execute(createCustomerDto: CreateCustomerDto) {
    const context: { userId?: string } = {};

    for (let step of this.steps) {
      try {
        this.LOGGER.log(`Invoking: ${step.name} ...`);
        await step.invoke(createCustomerDto, context);
        this.successfulSteps.unshift(step);
      } catch (error) {
        this.LOGGER.error(`Failed Step: ${step.name} !!`);
        this.successfulSteps.forEach(async (s) => {
          this.LOGGER.log(`Rolling back: ${s.name} ...`);
          await s.withCompensation(createCustomerDto, context);
        });

        throw new RpcException(error.message || 'Error in CreateCustomerSaga');
      }
    }
    this.LOGGER.log('Customer Creation Successful');
  }
}
