import { IsNotEmpty, IsUUID } from "class-validator";

export class HarvestIdParamsDto {
    @IsNotEmpty({ message: 'Id must be provided in params' })
    @IsUUID('4', { message: 'Id must be a valid UUID (version 4), it should be provided in params' })
    id: string;
}