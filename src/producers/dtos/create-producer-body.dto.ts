import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumberString, Length, MaxLength } from 'class-validator';

export class CreateProducerBodyDto {
    @IsNotEmpty()
    @Length(11, 14, { message: 'document must be between 11 and 14 digits' })
    @IsNumberString({}, { message: 'document must contain only numbers' })
    @Transform(({ value }) => value?.toString().trim().replace(/\D/g, ''))
    document: string;

    @IsNotEmpty()
    @MaxLength(150, { message: 'name must not exceed 150 characters' })
    @Transform(({ value }) => value?.toString().trim())
    name: string;
}