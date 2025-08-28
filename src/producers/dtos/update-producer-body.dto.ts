import { Transform } from 'class-transformer';
import {
    IsNotEmpty,
    IsNumberString,
    Length,
    MaxLength,
    IsOptional,
} from 'class-validator';

export class UpdateProducerBodyDto {
    @IsOptional()
    @Transform(({ value }) =>
        typeof value === 'string' ? value.replace(/\D/g, '') : value,
    )
    @Length(11, 14, { message: 'document must be between 11 and 14 digits' })
    @IsNumberString({}, { message: 'document must contain only numbers' })
    document?: string;

    @IsOptional()
    @IsNotEmpty({ message: 'name should not be empty' })
    @MaxLength(150, { message: 'name must not exceed 150 characters' })
    name?: string;
}
