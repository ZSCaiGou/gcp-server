import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity({
    comment: "游戏信息"
})
export class Games {
    @PrimaryColumn({
        comment: "游戏ID",
        type: "bigint",
        generated: true,
    })
    id: bigint;
    @PrimaryColumn({
        comment: "游戏标题",
        type: "varchar",
        length: 255,
    })
    title: string;
    @Column({
        comment: "游戏描述",
        type: "text",
    })
    description: string;
    
    @Column({
        comment: "游戏分类",
        type: "varchar",
        length: 255,
    })
    category: string;
    @Column({
        comment:"游戏标签",
        type:"json",
    })
    tags:JSON;
}