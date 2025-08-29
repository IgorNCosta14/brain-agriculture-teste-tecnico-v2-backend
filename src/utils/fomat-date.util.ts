export type CompletionMode = 'start' | 'end';

export class FormatDate {
    private static pad(n: number) { return String(n).padStart(2, '0'); }

    private static lastDayOfMonth(y: number, m: number) {
        return new Date(y, m, 0).getDate();
    }

    private static isValidYMD(y: number, m: number, d: number): boolean {
        if (y < 1 || m < 1 || m > 12 || d < 1) return false;
        return d <= this.lastDayOfMonth(y, m);
    }

    private static ymdToIso(y: number, m: number, d: number) {
        const mm = this.pad(m), dd = this.pad(d);
        return `${y}-${mm}-${dd}`;
    }

    static toIsoDate(value: unknown, opts: { mode?: CompletionMode } = {}): string {
        const mode: CompletionMode = opts.mode ?? 'start';
        if (typeof value !== 'string') return value as any;
        const v = value.trim();

        let m = v.match(/^(\d{4})[-\/](\d{2})[-\/](\d{2})$/);
        if (m) {
            const y = Number(m[1]), mo = Number(m[2]), d = Number(m[3]);
            if (!this.isValidYMD(y, mo, d)) return '__INVALID__';
            return this.ymdToIso(y, mo, d);
        }

        m = v.match(/^(\d{2})[-\/](\d{2})[-\/](\d{4})$/);
        if (m) {
            const d = Number(m[1]), mo = Number(m[2]), y = Number(m[3]);
            if (!this.isValidYMD(y, mo, d)) return '__INVALID__';
            return this.ymdToIso(y, mo, d);
        }

        m = v.match(/^(\d{4})[-\/](\d{2})$/);
        if (m) {
            const y = Number(m[1]), mo = Number(m[2]);
            if (mo < 1 || mo > 12) return '__INVALID__';
            const day = mode === 'end' ? this.lastDayOfMonth(y, mo) : 1;
            return this.ymdToIso(y, mo, day);
        }

        m = v.match(/^(\d{4})$/);
        if (m) {
            const y = Number(m[1]);
            const mo = mode === 'end' ? 12 : 1;
            const day = mode === 'end' ? this.lastDayOfMonth(y, mo) : 1;
            return this.ymdToIso(y, mo, day);
        }

        return v;
    }
}