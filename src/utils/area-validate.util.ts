import { BadRequestException } from "@nestjs/common";

export class AreaValidate {
    static validateAreas(total: string, arable: string, vegetation: string): void {
        const totalN = parseFloat(total);
        const arableN = parseFloat(arable);
        const vegetationN = parseFloat(vegetation);

        const invalid =
            [totalN, arableN, vegetationN].some(n => Number.isNaN(n)) ||
            totalN < 0 || arableN < 0 || vegetationN < 0;

        if (invalid) {
            throw new BadRequestException('Areas must be valid non-negative numbers');
        }

        if (arableN + vegetationN > totalN) {
            throw new BadRequestException(
                'The sum of arable area and vegetation area cannot exceed the total area'
            );
        }
    }
}