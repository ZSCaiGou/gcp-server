import { Game } from "src/common/entity/game.entity";

export class AdminAddUserDto {
    username: string;
    email: string;
    role: string;
    managed_communities: Game[];
}