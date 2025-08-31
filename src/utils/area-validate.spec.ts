import { BadRequestException } from '@nestjs/common';
import { AreaValidate } from './area-validate.util';

describe('AreaValidate.validateAreas', () => {
    describe('accepts valid non-negative numbers', () => {
        it('does not throw when arable + vegetation < total', () => {
            expect(() => AreaValidate.validateAreas('100', '40', '50')).not.toThrow();
        });

        it('does not throw when arable + vegetation == total (boundary)', () => {
            expect(() => AreaValidate.validateAreas('100', '60', '40')).not.toThrow();
            expect(() => AreaValidate.validateAreas('0', '0', '0')).not.toThrow();
        });

        it('accepts decimal strings and trims whitespace', () => {
            expect(() => AreaValidate.validateAreas(' 100.5 ', '60.25', '40.25')).not.toThrow();
        });

        it('accepts leading zeros', () => {
            expect(() => AreaValidate.validateAreas('0100', '0040', '00060')).not.toThrow();
        });
    });

    describe('rejects invalid numbers', () => {
        it.each([
            ['NaN total', 'foo', '10', '20'],
            ['NaN arable', '100', 'bar', '20'],
            ['NaN vegetation', '100', '10', 'baz'],
            ['empty strings', '', '', ''],
            ['whitespace-only', '   ', '  ', '\t'],
        ])('throws BadRequest when %s', (_label, total, arable, vegetation) => {
            expect(() => AreaValidate.validateAreas(total, arable, vegetation))
                .toThrow(BadRequestException);
        });

        it('uses the standard error message for invalid numbers', () => {
            try {
                AreaValidate.validateAreas('foo', '10', '20');
                fail('Expected BadRequestException');
            } catch (e: any) {
                expect(e).toBeInstanceOf(BadRequestException);
                expect(e.message).toContain('Areas must be valid non-negative numbers');
            }
        });

        it('rejects negative values', () => {
            expect(() => AreaValidate.validateAreas('-1', '0', '0')).toThrow(BadRequestException);
            expect(() => AreaValidate.validateAreas('100', '-5', '10')).toThrow(BadRequestException);
            expect(() => AreaValidate.validateAreas('100', '5', '-10')).toThrow(BadRequestException);
        });
    });

    describe('rejects when arable + vegetation exceeds total', () => {
        it('throws when sum > total', () => {
            expect(() => AreaValidate.validateAreas('100', '60', '50')).toThrow(BadRequestException);
        });

        it('uses the standard error message for exceeding sum', () => {
            try {
                AreaValidate.validateAreas('100', '90', '20');
                fail('Expected BadRequestException');
            } catch (e: any) {
                expect(e).toBeInstanceOf(BadRequestException);
                expect(e.message).toContain(
                    'The sum of arable area and vegetation area cannot exceed the total area',
                );
            }
        });
    });

    describe('edge cases', () => {
        it('treats comma-decimal strings as partial numbers due to parseFloat behavior', () => {
            expect(() => AreaValidate.validateAreas('10,5', '5', '5')).not.toThrow();
        });

        it('demonstrates floating-point precision pitfall (0.1 + 0.2 > 0.3)', () => {
            expect(() => AreaValidate.validateAreas('0.3', '0.1', '0.2')).toThrow(BadRequestException);
        });

        it('large values still validate correctly', () => {
            expect(() => AreaValidate.validateAreas('1000000000', '400000000', '500000000')).not.toThrow();
            expect(() => AreaValidate.validateAreas('1000000000', '900000000', '200000000')).toThrow(BadRequestException);
        });
    });
});
