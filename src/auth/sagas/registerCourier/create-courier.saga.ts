import { Inject, Injectable, Logger } from '@nestjs/common';
import { Step } from '../step';
import { CreateCourierDto } from '../dto';
import { CreateCourierStep, CreateCourierUserStep } from './steps';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class CreateCourierSaga {
  private readonly LOGGER = new Logger('CreateCourierSaga');
  private steps: Step<CreateCourierDto, void>[] = [];
  private successfulSteps: Step<CreateCourierDto, void>[] = [];

  constructor(
    @Inject('create-courier-user-step') step1: CreateCourierUserStep,
    @Inject('create-courier-step') step2: CreateCourierStep,
  ) {
    this.steps = [step1, step2];
  }

  async execute(createCourierDto: CreateCourierDto) {
    const context: { userId?: string } = {};

    for (let step of this.steps) {
      try {
        this.LOGGER.log(`Invoking: ${step.name} ...`);
        await step.invoke(createCourierDto, context);
        this.LOGGER.log('Successfully shifted');
        this.successfulSteps.unshift(step);
      } catch (error) {
        this.LOGGER.error(`Failed Step: ${step.name} !!`);
        this.successfulSteps.forEach(async (s) => {
          this.LOGGER.log(`Rolling back: ${s.name} ...`);
          await s.withCompensation(createCourierDto, context);
        });
        throw new RpcException(error.message || 'Error in CreateCourierSaga');
      }
    }
    this.LOGGER.log('Courier Creation Successful');
  }
}
