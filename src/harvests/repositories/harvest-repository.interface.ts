import { CreateHarvestDto } from "../dtos/create-harvest.dto";
import { FindAllHarvestsRespDto } from "../dtos/find-all-harvests-resp.dto";
import { FindAllHarvestsDto } from "../dtos/find-all-harvests.dto";
import { Harvest } from "../harvest.entity";

export interface IHarvestRepository {
    createHarvest(input: CreateHarvestDto): Promise<Harvest>;
    updateHarvest(harvest: Harvest): Promise<Harvest>;
    deleteHarvest(id: string): Promise<void>;
    findById(id: string): Promise<Harvest | null>;
    findAll({ order, page, limit, orderBy }: FindAllHarvestsDto): Promise<FindAllHarvestsRespDto>;
}