import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Obter todos os pagamentos
router.get('/', async (req, res) => {
    try {
        const payments = await prisma.payment.findMany({ include: { client: true } });
        res.json(payments);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar pagamentos' });
    }
});

// Criar um novo pagamento
router.post('/', async (req, res) => {
    const { clientId, amount, paymentMethod, installments } = req.body;

    if (!paymentMethod) {
        return res.status(400).json({ error: 'Método de pagamento é obrigatório' });
    }

    // Se o método de pagamento for cartão, 'installments' deve ser um número válido
    if (paymentMethod === 'cartao' && (installments == null || isNaN(installments) || installments < 1)) {
        return res.status(400).json({ error: 'Número de parcelas inválido para cartão' });
    }

    try {
        const payment = await prisma.payment.create({
            data: {
                clientId,
                amount,
                paymentMethod,
                installments: paymentMethod === 'Cartão de Crédito' ? parseInt(installments) : null,
            },
        });
        res.status(201).json(payment);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao criar pagamento' });
    }
});



// Obter um pagamento pelo ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const payment = await prisma.payment.findUnique({
            where: { id: Number(id) },
            include: { client: true },
        });
        payment ? res.json(payment) : res.status(404).json({ error: 'Pagamento não encontrado' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar pagamento' });
    }
});

// Atualizar um pagamento
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { clientId, amount, paymentMethod, installments } = req.body;
    if (!paymentMethod) {
        return res.status(400).json({ error: 'Método de pagamento é obrigatório' });
    }
    try {
        const payment = await prisma.payment.update({
            where: { id: Number(id) },
            data: {
                clientId,
                amount,
                paymentMethod,
                installments: paymentMethod === 'Cartão de Crédito' ? installments : null,
            },
        });
        res.json(payment);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao atualizar pagamento' });
    }
});

// Deletar um pagamento
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.payment.delete({ where: { id: Number(id) } });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Erro ao deletar pagamento' });
    }
});

export default router;

