export type PieItem = { label: string; value: number | string };

export interface IReportsReadRepository {
    totalFarms(): Promise<number>;
    totalHectares(): Promise<string>;
    farmsByState(): Promise<PieItem[]>;
    farmsByCrop(): Promise<PieItem[]>;
    landUse(): Promise<PieItem[]>;
}