import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

router.get('/', async (req, res) => {
    try {
        const products = await prisma.product.findMany();
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar produtos' });
    }
});

router.post('/', async (req, res) => {
    const { name, price, stock } = req.body;
    try {
        const product = await prisma.product.create({
            data: { name, price, stock },
        });
        res.status(201).json(product);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao criar produto' });
    }
});

router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const product = await prisma.product.findUnique({ where: { id: Number(id) } });
        product ? res.json(product) : res.status(404).json({ error: 'Produto não encontrado' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar produto' });
    }
});

router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { name, price, stock } = req.body;
    try {
        const product = await prisma.product.update({
            where: { id: Number(id) },
            data: { name, price, stock },
        });
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao atualizar produto' });
    }
});

router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.product.delete({ where: { id: Number(id) } });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Erro ao deletar produto' });
    }
});

export default router;
