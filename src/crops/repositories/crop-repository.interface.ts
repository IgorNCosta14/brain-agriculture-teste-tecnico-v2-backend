import { Crop } from "../crop.entity";
import { FindAllRespDto } from "../dtos/find-all-resp.dto";
import { FindAllDto } from "../dtos/find-all.dto";

export interface ICropRepository {
    createCrop(name: string): Promise<Crop>;
    findByName(name: string): Promise<Crop | null>;
    findById(id: string): Promise<Crop | null>;
    findAll({
        order,
        page,
        limit
    }: FindAllDto): Promise<FindAllRespDto>
}