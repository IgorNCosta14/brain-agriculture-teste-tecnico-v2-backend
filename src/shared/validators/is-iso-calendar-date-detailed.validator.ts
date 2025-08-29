import { registerDecorator, ValidationArguments, ValidationOptions } from 'class-validator';

function isLeapYear(y: number) {
    return (y % 4 === 0 && y % 100 !== 0) || (y % 400 === 0);
}
function lastDayOfMonth(y: number, m: number) {
    return new Date(y, m, 0).getDate();
}
function pad2(n: number) {
    return String(n).padStart(2, '0');
}

export function IsIsoCalendarDateDetailed(validationOptions?: ValidationOptions) {
    return function (object: any, propertyName: string) {
        registerDecorator({
            name: 'IsIsoCalendarDateDetailed',
            target: object.constructor,
            propertyName,
            options: validationOptions,
            validator: {
                validate(value: any) {
                    if (typeof value !== 'string') return false;
                    const m = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
                    if (!m) return false;

                    const y = Number(m[1]);
                    const mo = Number(m[2]);
                    const d = Number(m[3]);

                    if (!Number.isInteger(y) || !Number.isInteger(mo) || !Number.isInteger(d)) return false;
                    if (mo < 1 || mo > 12) return false;
                    if (d < 1) return false;

                    const last = lastDayOfMonth(y, mo);
                    if (d > last) return false;

                    return true;
                },

                defaultMessage(args?: ValidationArguments) {
                    const prop = args?.property ?? 'date';
                    const v = String(args?.value);

                    const m = v.match(/^(\d{4})-(\d{2})-(\d{2})$/);
                    if (!m) {
                        return `${prop} must match YYYY-MM-DD`;
                    }

                    const y = Number(m[1]);
                    const mo = Number(m[2]);
                    const d = Number(m[3]);

                    if (mo < 1 || mo > 12) {
                        return `${prop} month must be between 01 and 12`;
                    }
                    if (d < 1) {
                        return `${prop} day must be greater than or equal to 01`;
                    }

                    const last = lastDayOfMonth(y, mo);
                    if (mo === 2 && d === 29 && !isLeapYear(y)) {
                        return `${prop} February 29 is invalid in ${y} (not a leap year)`;
                    }
                    if (d > last) {
                        return `${prop} day must be between 01 and ${pad2(last)} for ${pad2(mo)}/${y}`;
                    }

                    return `${prop} must be a valid calendar date (YYYY-MM-DD)`;
                },
            },
        });
    };
}
