import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { User } from '../users/user.entity';  // Adjust import as per your folder structure

@Entity()
export class Movie {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  publishingYear: number;

  @Column({ nullable: true })
  poster: string;

  @ManyToOne(() => User, (user) => user.movies, { onDelete: 'CASCADE' })
  user: User;
}
