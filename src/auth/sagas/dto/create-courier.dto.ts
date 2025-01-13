import { IsEnum, IsString, ValidateNested } from 'class-validator';
import { RegisterUserDto } from '../../dto/register-user.dto';
import { VehicleType, VehicleTypeList } from '../../enum/vehicle-type.enum';
import { Type } from 'class-transformer';
import { AddressDto } from './address.dto';

export class CreateCourierDto {
  @ValidateNested()
  @Type(() => RegisterUserDto)
  user: RegisterUserDto;

  @IsString()
  @IsEnum(VehicleType, {
    message: `Vehicle type must be one of the following: ${VehicleTypeList}`,
  })
  vehicleType: VehicleType;
}
