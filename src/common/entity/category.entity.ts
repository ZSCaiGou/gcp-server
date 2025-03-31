import { PrimaryGeneratedColumn, Column, Entity } from "typeorm";

@Entity()
export class Category {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: "varchar",
        length: 255,
    })
    name: string;


    @Column({
        type:"boolean",
        default:false,
    })
    isMain: boolean;
}