import { PieItem } from "../repositories/reports-read-repository.interface";

export type OverviewResponse = {
    totalFarms: number;
    totalHectares: string;
    farmsByState: PieItem[];
    farmsByCrop: PieItem[];
    landUse: PieItem[];
};