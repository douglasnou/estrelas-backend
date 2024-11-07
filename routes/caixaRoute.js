import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Rota para obter o caixa
router.get('/', async (req, res) => {
    try {
        const caixa = await prisma.caixa.findFirst();
        res.json({ valor: caixa ? caixa.valor : 0 });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao obter valor em caixa' });
    }
});

// Rota para atualizar o caixa
router.put('/', async (req, res) => {
    const { amount, operation } = req.body;
    try {
        const caixa = await prisma.caixa.findFirst();
        const updatedValue = operation === 'add' ? caixa.valor + amount : caixa.valor - amount;

        const updatedCaixa = await prisma.caixa.update({
            where: { id: caixa.id },
            data: { valor: updatedValue },
        });
        res.json(updatedCaixa);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao atualizar valor em caixa' });
    }
});

// Rota para criar o caixa
router.post('/', async (req, res) => {
    const { valor } = req.body;
    try {
        const caixa = await prisma.caixa.create({
            data: { valor }
        });
        res.status(201).json(caixa);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao criar caixa' });
    }
});


export default router;
