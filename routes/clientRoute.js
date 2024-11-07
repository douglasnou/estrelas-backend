import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

router.get('/', async (req, res) => {
    try {
        const clients = await prisma.client.findMany();
        res.json(clients);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar clientes' });
    }
});

router.post('/', async (req, res) => {
    const { name, email, phone, address } = req.body;
    try {
        const client = await prisma.client.create({
            data: { name, email, phone, address },
        });
        res.status(201).json(client);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao criar cliente' });
    }
});

router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const client = await prisma.client.findUnique({ where: { id: Number(id) } });
        client ? res.json(client) : res.status(404).json({ error: 'Cliente não encontrado' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar cliente' });
    }
});

router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { name, email, phone, address } = req.body;
    try {
        const client = await prisma.client.update({
            where: { id: Number(id) },
            data: { name, email, phone, address },
        });
        res.json(client);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao atualizar cliente' });
    }
});

router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.client.delete({ where: { id: Number(id) } });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Erro ao deletar cliente' });
    }
});

export default router;
