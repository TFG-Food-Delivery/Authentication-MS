import { CreateCourierSaga } from './registerCourier/create-courier.saga';
import {
  CreateCourierStep,
  CreateCourierUserStep,
} from './registerCourier/steps';
import { CreateCustomerSaga } from './registerCustomer/create-customer.saga';
import {
  CreateCustomerStep,
  CreateCustomerUserStep,
} from './registerCustomer/steps';
import { CreateRestaurantSaga } from './registerRestaurant/create-restaurant.saga';
import {
  CreateRestaurantStep,
  CreateRestaurantUserStep,
} from './registerRestaurant/steps';

export const sagasProviders = [
  /* ------------------------------- RESTAURANT ------------------------------- */
  {
    provide: 'create-restaurant-saga',
    useClass: CreateRestaurantSaga,
  },
  {
    provide: 'create-restaurant-user-step',
    useClass: CreateRestaurantUserStep,
  },
  {
    provide: 'create-restaurant-step',
    useClass: CreateRestaurantStep,
  },
  /* -------------------------------- CUSTOMER -------------------------------- */
  {
    provide: 'create-customer-saga',
    useClass: CreateCustomerSaga,
  },
  {
    provide: 'create-customer-user-step',
    useClass: CreateCustomerUserStep,
  },
  {
    provide: 'create-customer-step',
    useClass: CreateCustomerStep,
  },
  /* -------------------------------- COURIER -------------------------------- */
  {
    provide: 'create-courier-saga',
    useClass: CreateCourierSaga,
  },
  {
    provide: 'create-courier-user-step',
    useClass: CreateCourierUserStep,
  },
  {
    provide: 'create-courier-step',
    useClass: CreateCourierStep,
  },
];
