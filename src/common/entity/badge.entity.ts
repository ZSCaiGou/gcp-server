import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({
    comment: '徽章表',
})
export class Badge {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: 'varchar',
        length: 255,
        comment: '徽章名称',
    })
    name: string;

    @Column({
        type: 'varchar',
        length: 255,
        comment: '徽章描述',
    })
    description: string;

    @Column({
        type: 'varchar',
        length: 255,
        comment: '徽章图片',
    })
    image: string;

}
