import { Contact } from "src/contacts/entities/contact.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class User {
    @PrimaryGeneratedColumn('uuid')
    id:string;

    @Column()
    name:string;

    @Column({unique:true, length: 255})
    email:string;

    @Column()
    passwordHash: string;

    @OneToMany(() => Contact, (contact) => contact.user)
    contacts: Contact[];
}