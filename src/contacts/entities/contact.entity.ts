import { User } from "src/users/entities/user.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Contact {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({unique: true})
    email: string;

    @Column()
    phone:string;

    @CreateDateColumn()
    createdAt?: Date;

    @ManyToOne(() => User, (user) => user.contacts, {onDelete: 'CASCADE'})
    userId: User;
}
