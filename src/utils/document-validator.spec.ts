import { BadRequestException } from '@nestjs/common';
import { DocumentValidator } from './document-validator.util';
import { DocumentType } from '../shared/enums/document-type.enum';

describe('DocumentValidator.validate', () => {
    describe('CPF validation', () => {
        it.each([
            ['52998224725', DocumentType.CPF],
            ['16899535009', DocumentType.CPF],
            ['11144477735', DocumentType.CPF],
            ['12345678909', DocumentType.CPF],
            ['529.982.247-25', DocumentType.CPF],
            ['168.995.350-09', DocumentType.CPF],
            ['111.444.777-35', DocumentType.CPF],
            ['123.456.789-09', DocumentType.CPF],
        ])('returns CPF for valid cpf: %s', (doc, expected) => {
            expect(DocumentValidator.validate(doc)).toBe(expected);
        });

        it('throws BadRequest for invalid cpf (checksum)', () => {
            const invalid = '52998224720';
            expect(() => DocumentValidator.validate(invalid)).toThrow(BadRequestException);
        });

        it('throws BadRequest for invalid cpf (repeated digits)', () => {
            expect(() => DocumentValidator.validate('00000000000')).toThrow(BadRequestException);
            expect(() => DocumentValidator.validate('11111111111')).toThrow(BadRequestException);
            expect(() => DocumentValidator.validate('99999999999')).toThrow(BadRequestException);
        });

        it('throws BadRequest for invalid cpf (length)', () => {
            expect(() => DocumentValidator.validate('5299822472')).toThrow(BadRequestException);
            expect(() => DocumentValidator.validate('529982247252')).toThrow(BadRequestException);
        });

        describe('CNPJ validation', () => {
            it.each([
                ['04252011000110', DocumentType.CNPJ],
                ['40688134000161', DocumentType.CNPJ],
                ['19131243000197', DocumentType.CNPJ],
                ['11222333000181', DocumentType.CNPJ],
                ['04.252.011/0001-10', DocumentType.CNPJ],
                ['40.688.134/0001-61', DocumentType.CNPJ],
                ['19.131.243/0001-97', DocumentType.CNPJ],
                ['11.222.333/0001-81', DocumentType.CNPJ],
            ])('returns CNPJ for valid cnpj: %s', (doc, expected) => {
                expect(DocumentValidator.validate(doc)).toBe(expected);
            });

            it('throws BadRequest for invalid cnpj (checksum)', () => {
                const invalid = '04252011000111';
                expect(() => DocumentValidator.validate(invalid)).toThrow(BadRequestException);
            });

            it('throws BadRequest for invalid cnpj (repeated digits)', () => {
                expect(() => DocumentValidator.validate('00000000000000')).toThrow(BadRequestException);
                expect(() => DocumentValidator.validate('11111111111111')).toThrow(BadRequestException);
                expect(() => DocumentValidator.validate('99999999999999')).toThrow(BadRequestException);
            });

            it('throws BadRequest for invalid cnpj (length)', () => {
                expect(() => DocumentValidator.validate('0425201100011')).toThrow(BadRequestException);
                expect(() => DocumentValidator.validate('042520110001100')).toThrow(BadRequestException);
            });
        });

        describe('cleans non-digit characters', () => {
            it('accepts formatted cpf/cnpj by stripping non-digits', () => {
                expect(DocumentValidator.validate('529.982.247-25')).toBe(DocumentType.CPF);
                expect(DocumentValidator.validate('04.252.011/0001-10')).toBe(DocumentType.CNPJ);
            });
        });

        describe('error message', () => {
            it('uses the standard error message for invalid documents', () => {
                try {
                    DocumentValidator.validate('not-a-document');
                    fail('Expected to throw BadRequestException');
                } catch (e: any) {
                    expect(e).toBeInstanceOf(BadRequestException);
                    expect(e.message).toContain('Invalid document. Must be a valid CPF or CNPJ.');
                }
            });
        });

        describe('edge cases', () => {
            it('throws for empty or whitespace-only strings', () => {
                expect(() => DocumentValidator.validate('')).toThrow(BadRequestException);
                expect(() => DocumentValidator.validate('   ')).toThrow(BadRequestException);
            });

            it('throws for non-digit garbage even after cleaning', () => {
                expect(() => DocumentValidator.validate('abc.def/ghi-jk')).toThrow(BadRequestException);
            });
        });
    })
})