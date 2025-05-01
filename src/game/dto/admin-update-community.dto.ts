import { GameStatus } from "src/common/entity/game.entity";

export class AdminUpdateCommunityDto {
    title: string;
    description: string;
    game_img_url: string;
    category: string[];
    status: GameStatus;
}