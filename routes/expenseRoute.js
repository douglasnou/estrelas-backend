import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Obter todas as despesas
router.get('/', async (req, res) => {
    try {
        const expenses = await prisma.expense.findMany();
        res.json(expenses);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar despesas' });
    }
});

// Criar uma nova despesa
router.post('/', async (req, res) => {
    console.log("Dados recebidos:", req.body); 

    const { description, amount } = req.body;
    if (typeof description !== 'string' || typeof amount !== 'number') {
        return res.status(400).json({ error: 'Dados inválidos' }); 
    }

    try {
        const expense = await prisma.expense.create({
            data: {
                description,
                amount,
                date: new Date(),
            },
        });
        res.status(201).json(expense);
    } catch (error) {
        console.error("Erro ao criar despesa:", error);
        res.status(500).json({ error: 'Erro ao criar despesa' });
    }
});


// Obter uma despesa pelo ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const expense = await prisma.expense.findUnique({ where: { id: Number(id) } });
        expense ? res.json(expense) : res.status(404).json({ error: 'Despesa não encontrada' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar despesa' });
    }
});

// Atualizar uma despesa
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { description, amount } = req.body;
    try {
        const expense = await prisma.expense.update({
            where: { id: Number(id) },
            data: { description, amount },
        });
        res.json(expense);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao atualizar despesa' });
    }
});

// Deletar uma despesa
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.expense.delete({ where: { id: Number(id) } });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Erro ao deletar despesa' });
    }
});

export default router;
