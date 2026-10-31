import { Injectable, OnModuleInit } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";
import * as bcrypt from 'bcrypt';
import { Role } from "../generated/prisma/client.js";

@Injectable()
export class SeedService implements OnModuleInit {

    constructor(
        private readonly prisma: PrismaService
    ) { }

    onModuleInit() {
        this.seed();
    }

    async seed() {
        const isSeeded = await this.isSeeded();
        if (!isSeeded) {
            const hashedPassword = await bcrypt.hash("12345678", 10);

            const admin = await this.prisma.user.create({
                data: {
                    firstName: "Toqa",
                    lastName: "Balt",
                    age: 20,
                    role: Role.ADMIN,
                    email: "toqa@gmail.com",
                    username: 'toqa',
                    password: hashedPassword
                }
            });

            const supervisor1 = await this.prisma.user.create({
                data: {
                    firstName: "Sara",
                    lastName: "Ahmad",
                    age: 28,
                    role: Role.SUPERVISOR,
                    email: "sara.sup@sanad.org",
                    username: 'sara_sup',
                    password: hashedPassword
                }
            });

            const supervisor2 = await this.prisma.user.create({
                data: {
                    firstName: "Rami",
                    lastName: "Khaled",
                    age: 32,
                    role: Role.SUPERVISOR,
                    email: "rami.sup@sanad.org",
                    username: 'rami_sup',
                    password: hashedPassword
                }
            });

            const trainee1 = await this.prisma.user.create({
                data: {
                    firstName: "Karam",
                    lastName: "Masri",
                    age: 22,
                    role: Role.TRAINEE,
                    email: "karam.trainee@sanad.org",
                    username: 'karam_tr',
                    password: hashedPassword
                }
            });

            const trainee2 = await this.prisma.user.create({
                data: {
                    firstName: "Lina",
                    lastName: "Hassan",
                    age: 23,
                    role: Role.TRAINEE,
                    email: "lina.trainee@sanad.org",
                    username: 'lina_tr',
                    password: hashedPassword
                }
            });

            const trainee3 = await this.prisma.user.create({
                data: {
                    firstName: "Omar",
                    lastName: "Nasser",
                    age: 24,
                    role: Role.TRAINEE,
                    email: "omar.trainee@sanad.org",
                    username: 'omar_tr',
                    password: hashedPassword
                }
            });

            const program1 = await this.prisma.program.create({
                data: {
                    title: "Advanced Backend Bootcamp",
                    description: "Intensive bootcamp for building and securing REST APIs.",
                    seats: 2,
                    image: "backend-bootcamp.png",
                    supervisorId: supervisor1.id
                }
            });

            const program2 = await this.prisma.program.create({
                data: {
                    title: "PostgreSQL Database Fundamentals",
                    description: "Learn schema design and Prisma ORM.",
                    seats: 15,
                    image: "database-course.png",
                    supervisorId: supervisor1.id
                }
            });

            const program3 = await this.prisma.program.create({
                data: {
                    title: "UI/UX Design Essentials",
                    description: "Introduction to user experience and Figma.",
                    seats: 10,
                    image: "uiux-course.png",
                    supervisorId: supervisor2.id
                }
            });

            const program4 = await this.prisma.program.create({
                data: {
                    title: "Leadership and Agile Project Management",
                    description: "Manage technical projects efficiently.",
                    seats: 20,
                    image: "leadership-course.png",
                    supervisorId: supervisor2.id
                }
            });

            await this.prisma.programMeeting.createMany({
                data: [
                    {
                        date: new Date("2026-11-10T10:00:00Z"),
                        time: "10:00 AM - 12:00 PM",
                        location: "Lab A - Main Building",
                        programId: program1.id
                    },
                    {
                        date: new Date("2026-11-12T14:00:00Z"),
                        time: "02:00 PM - 04:00 PM",
                        url: "https://meet.google.com/abc-defg-hij",
                        programId: program1.id
                    },
                    {
                        date: new Date("2026-11-15T11:00:00Z"),
                        time: "11:00 AM - 01:00 PM",
                        location: "Lab B",
                        programId: program2.id
                    }
                ]
            });

            await this.prisma.material.createMany({
                data: [
                    {
                        title: "Lecture 1: Introduction to NestJS Architecture",
                        file: "uploads/materials/nestjs-lecture1.pdf",
                        programId: program1.id
                    },
                    {
                        title: "Lecture 2: Guards and Interceptors",
                        file: "uploads/materials/nestjs-lecture2.pptx",
                        programId: program1.id
                    },
                    {
                        title: "PostgreSQL Cheat Sheet",
                        file: "uploads/materials/postgres-guide.pdf",
                        programId: program2.id
                    }
                ]
            });

            await this.prisma.announcement.createMany({
                data: [
                    {
                        title: "Autumn Training Programs Registration Open",
                        content: "Sanad Youth announces open registration for all programs.",
                        programId: null
                    },
                    {
                        title: "Personal Interview Schedules",
                        content: "All applicants must adhere to the scheduled session times.",
                        programId: null
                    },
                    {
                        title: "Environment Setup Before Session 1",
                        content: "Please install Node.js and PostgreSQL before attending.",
                        programId: program1.id
                    },
                    {
                        title: "Figma Account Preparation",
                        content: "Please create a free Figma account before the UI/UX workshop.",
                        programId: program3.id
                    }
                ]
            });
        }
    }

    async isSeeded() {
        const doesExist = await this.prisma.user.findUnique({
            where: { username: "toqa" }
        });
        return !!doesExist;
    }
}