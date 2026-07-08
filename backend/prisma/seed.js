import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const prisma = new PrismaClient();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
async function readSeedData() {
    const filePath = path.resolve(__dirname, '../../relib/src/data/dummy.json');
    const raw = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(raw);
}
async function main() {
    const data = await readSeedData();
    await prisma.refreshToken.deleteMany();
    await prisma.userRight.deleteMany();
    await prisma.rolePageAccess.deleteMany();
    await prisma.userRole.deleteMany();
    await prisma.page.deleteMany();
    await prisma.role.deleteMany();
    await prisma.user.deleteMany();
    for (const user of data.users) {
        await prisma.user.create({
            data: {
                id: user.uid,
                name: user.name,
                age: user.age,
                email: user.email,
                username: user.username,
                passwordHash: await argon2.hash(user.password),
                accessLevel: user.accessLevel
            }
        });
    }
    await prisma.role.createMany({ data: data.roles });
    await prisma.page.createMany({ data: data.pages });
    await prisma.userRole.createMany({
        data: data.userRoles.map((entry) => ({ userId: entry.uid, roleId: entry.roleId }))
    });
    await prisma.rolePageAccess.createMany({
        data: data.rolePageAccess.map((entry) => ({ roleId: entry.roleId, pageId: entry.pageId }))
    });
    await prisma.userRight.createMany({
        data: data.userRights.map((entry) => ({
            pageId: entry.pageId,
            readOnly: entry.readOnly,
            readWrite: entry.readWrite,
            deleteLevel: entry.delete
        }))
    });
    console.log('Seed completed');
}
main()
    .catch((error) => {
    console.error(error);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
