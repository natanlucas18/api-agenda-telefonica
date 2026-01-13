import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class User {
    @PrimaryGeneratedColumn('uuid')
    id:string;

    @Column()
    name:string;

    @Column({unique:true, length: 255})
    email:string;

    @Column()
    password: string;
}