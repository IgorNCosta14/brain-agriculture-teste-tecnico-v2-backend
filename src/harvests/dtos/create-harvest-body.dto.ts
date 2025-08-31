import { Transform } from "class-transformer";
import { IsInt, IsNotEmpty, IsString, Matches, Max, Min } from "class-validator";
import { FormatDate } from "../../utils/fomat-date.util";

export class CreateHarvestBodyDto {
    @IsString()
    @IsNotEmpty()
    label: string;

    @Transform(({ value }) => (typeof value === 'string' ? Number(value) : value))
    @IsInt()
    @Min(1800)
    @Max(9999)
    year: number;

    @Transform(({ value }) => FormatDate.toIsoDate(value))
    @Matches(/^\d{4}-\d{2}-\d{2}$/, {
        message: 'startDate must be a valid date in YYYY-MM-DD format',
    })
    startDate: string;

    @Transform(({ value }) => FormatDate.toIsoDate(value))
    @Matches(/^\d{4}-\d{2}-\d{2}$/, {
        message: 'endDate must be a valid date in YYYY-MM-DD format',
    })
    endDate: string;
}