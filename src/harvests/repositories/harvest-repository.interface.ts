import { CreateHarvestDto } from "../dtos/create-harvest.dto";
import { Harvest } from "../harvest.entity";

export interface IHarvestRepository {
    createHarvest(input: CreateHarvestDto): Promise<Harvest>;
    updateHarvest(harvest: Harvest): Promise<Harvest>;
    deleteHarvest(id: string): Promise<void>;
    findById(id: string): Promise<Harvest | null>;
    findAll(): Promise<Harvest[]>;
}