import { BadRequestException } from '@nestjs/common';
import { DocumentType } from '../shared/enums/document-type.enum'

export class DocumentValidator {
    static validate(document: string): DocumentType {
        const cleanDoc = document.replace(/\D/g, '');

        if (this.isValidCPF(cleanDoc)) {
            return DocumentType.CPF;
        }

        if (this.isValidCNPJ(cleanDoc)) {
            return DocumentType.CNPJ;
        }

        throw new BadRequestException('Invalid document. Must be a valid CPF or CNPJ.');
    }

    private static isValidCPF(cpf: string): boolean {
        if (!cpf || cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;

        let sum = 0;
        let rest;

        for (let i = 1; i <= 9; i++) {
            sum += parseInt(cpf.substring(i - 1, i)) * (11 - i);
        }
        rest = (sum * 10) % 11;
        if (rest === 10 || rest === 11) rest = 0;
        if (rest !== parseInt(cpf.substring(9, 10))) return false;

        sum = 0;
        for (let i = 1; i <= 10; i++) {
            sum += parseInt(cpf.substring(i - 1, i)) * (12 - i);
        }
        rest = (sum * 10) % 11;
        if (rest === 10 || rest === 11) rest = 0;
        return rest === parseInt(cpf.substring(10, 11));
    }

    private static isValidCNPJ(cnpj: string): boolean {
        if (!cnpj || cnpj.length !== 14 || /^(\d)\1+$/.test(cnpj)) return false;

        const validateDigit = (base: string, length: number): number => {
            let sum = 0;
            let pos = length - 7;
            for (let i = length; i >= 1; i--) {
                sum += parseInt(base.charAt(length - i)) * pos--;
                if (pos < 2) pos = 9;
            }
            const result = sum % 11;
            return result < 2 ? 0 : 11 - result;
        };

        const base = cnpj.substring(0, 12);
        const digit1 = validateDigit(base, 12);
        const digit2 = validateDigit(base + digit1, 13);

        return cnpj === base + digit1.toString() + digit2.toString();
    }
}