import { PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";

export class CommunityLog {
    @PrimaryColumn({
        type:"bigint",
        generated:true,
    })
    id: bigint;
    
    content: string;


    created_at: Date;
}