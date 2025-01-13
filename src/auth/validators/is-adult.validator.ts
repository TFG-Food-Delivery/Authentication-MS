import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export function IsAdult(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isAdult',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          if (!(value instanceof Date)) return false; // Verifica si es una fecha
          const today = new Date();
          const age = today.getFullYear() - value.getFullYear();
          const isBirthdayPassed =
            today.getMonth() > value.getMonth() ||
            (today.getMonth() === value.getMonth() &&
              today.getDate() >= value.getDate());
          return age > 18 || (age === 18 && isBirthdayPassed);
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must indicate an age of at least 18 years.`;
        },
      },
    });
  };
}
