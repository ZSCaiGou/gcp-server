import { TargetType } from "src/common/entity/interaction.entity";

export class AddLikeDto {
    target_type: TargetType;
    target_id: string;
}