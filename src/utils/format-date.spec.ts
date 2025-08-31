import { FormatDate, CompletionMode } from './fomat-date.util';

describe('FormatDate.toIsoDate', () => {
    describe('returns ISO when full Y-M-D input', () => {
        it.each([
            ['2024-01-05', '2024-01-05'],
            ['2024/01/05', '2024-01-05'],
            ['1999-12-31', '1999-12-31'],
            ['1999/12/31', '1999-12-31'],
            ['  2023-07-09  ', '2023-07-09'],
        ])('parses "%s" => %s', (input, expected) => {
            expect(FormatDate.toIsoDate(input)).toBe(expected);
        });

        it('rejects invalid Y-M-D date with "__INVALID__"', () => {
            expect(FormatDate.toIsoDate('2023-02-30')).toBe('__INVALID__');
            expect(FormatDate.toIsoDate('2023/13/10')).toBe('__INVALID__');
            expect(FormatDate.toIsoDate('0000-01-01')).toBe('__INVALID__');
            expect(FormatDate.toIsoDate('2023-00-10')).toBe('__INVALID__');
            expect(FormatDate.toIsoDate('2023-01-00')).toBe('__INVALID__');
        });

        it('handles leap years correctly', () => {
            expect(FormatDate.toIsoDate('2024-02-29')).toBe('2024-02-29');
            expect(FormatDate.toIsoDate('2023-02-29')).toBe('__INVALID__');
        });
    });

    describe('returns ISO when D-M-Y input', () => {
        it.each([
            ['05-01-2024', '2024-01-05'],
            ['05/01/2024', '2024-01-05'],
            ['31-12-1999', '1999-12-31'],
            ['09/07/2023', '2023-07-09'],
        ])('parses "%s" => %s', (input, expected) => {
            expect(FormatDate.toIsoDate(input)).toBe(expected);
        });

        it('rejects invalid D-M-Y date with "__INVALID__"', () => {
            expect(FormatDate.toIsoDate('30-02-2023')).toBe('__INVALID__');
            expect(FormatDate.toIsoDate('10-13-2023')).toBe('__INVALID__');
            expect(FormatDate.toIsoDate('00-01-2023')).toBe('__INVALID__');
            expect(FormatDate.toIsoDate('01-00-2023')).toBe('__INVALID__');
        });

        it('handles leap years correctly in D-M-Y', () => {
            expect(FormatDate.toIsoDate('29-02-2024')).toBe('2024-02-29');
            expect(FormatDate.toIsoDate('29/02/2023')).toBe('__INVALID__');
        });
    });

    describe('YYYY-MM completion by mode', () => {
        it('defaults to mode "start" (YYYY-MM-01)', () => {
            expect(FormatDate.toIsoDate('2023-07')).toBe('2023-07-01');
            expect(FormatDate.toIsoDate('2023/07')).toBe('2023-07-01');
        });

        it('completes with last day of month when mode is "end"', () => {
            const opts = { mode: 'end' as CompletionMode };
            expect(FormatDate.toIsoDate('2023-07', opts)).toBe('2023-07-31');
            expect(FormatDate.toIsoDate('2024-02', opts)).toBe('2024-02-29');
            expect(FormatDate.toIsoDate('2023-02', opts)).toBe('2023-02-28');
        });

        it('rejects invalid month', () => {
            expect(FormatDate.toIsoDate('2023-00')).toBe('__INVALID__');
            expect(FormatDate.toIsoDate('2023-13')).toBe('__INVALID__');
        });
    });

    describe('YYYY completion by mode', () => {
        it('defaults to mode "start" (YYYY-01-01)', () => {
            expect(FormatDate.toIsoDate('2023')).toBe('2023-01-01');
            expect(FormatDate.toIsoDate('1999')).toBe('1999-01-01');
        });

        it('completes with 12-31 when mode is "end"', () => {
            const opts = { mode: 'end' as CompletionMode };
            expect(FormatDate.toIsoDate('2023', opts)).toBe('2023-12-31');
            expect(FormatDate.toIsoDate('2024', opts)).toBe('2024-12-31');
        });
    });

    describe('passes-through or trims original value when not matching known patterns', () => {
        it.each([
            ['  hello world  ', 'hello world'],
            ['2023-7-1', '2023-7-1'],
            ['05-01-24', '05-01-24'],
            ['2023/7', '2023/7'],
        ])('returns original "%s"', (input, expected) => {
            expect(FormatDate.toIsoDate(input)).toBe(expected);
        });
    });

    describe('returns non-string values as-is', () => {
        it('returns numbers, null, undefined, objects untouched', () => {
            expect(FormatDate.toIsoDate(123 as any)).toBe(123 as any);
            expect(FormatDate.toIsoDate(null as any)).toBe(null as any);
            expect(FormatDate.toIsoDate(undefined as any)).toBe(undefined as any);
            const obj = { a: 1 };
            expect(FormatDate.toIsoDate(obj as any)).toBe(obj as any);
        });
    });
});