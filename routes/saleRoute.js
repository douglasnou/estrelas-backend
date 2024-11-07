import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Buscar todas as vendas com informações do cliente e produtos
router.get('/', async (req, res) => {
    try {
        const sales = await prisma.sale.findMany({ include: { client: true, products: true } });
        res.json(sales);
    } catch (error) {
        console.error("Erro ao buscar vendas:", error);
        res.status(500).json({ error: 'Erro ao buscar vendas' });
    }
});

// Exemplo na rota de criação de venda
router.post('/', async (req, res) => {
    const { clientId, products } = req.body;
    try {
        const productData = await prisma.product.findMany({
            where: { id: { in: products } },
            select: { id: true, price: true, stock: true } // Inclua o estoque
        });

        // Calcular o total e verificar se o estoque é suficiente
        let total = 0;
        for (const product of productData) {
            if (product.stock <= 0) {
                return res.status(400).json({ error: `Produto ${product.id} sem estoque suficiente.` });
            }
            total += product.price;
        }

        // Criar a venda
        const sale = await prisma.sale.create({
            data: {
                clientId,
                total,
                products: { connect: products.map(productId => ({ id: productId })) },
            },
        });

        // Atualizar o estoque dos produtos
        await Promise.all(
            products.map(productId =>
                prisma.product.update({
                    where: { id: productId },
                    data: { stock: { decrement: 1 } } // Decrementa o estoque
                })
            )
        );

        res.status(201).json(sale);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao criar venda' });
    }
});



// Buscar uma venda específica pelo ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const sale = await prisma.sale.findUnique({
            where: { id: Number(id) },
            include: { client: true, products: true },
        });
        
        if (sale) {
            res.json(sale);
        } else {
            res.status(404).json({ error: 'Venda não encontrada' });
        }
    } catch (error) {
        console.error("Erro ao buscar venda:", error);
        res.status(500).json({ error: 'Erro ao buscar venda' });
    }
});

// Atualizar uma venda existente
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { clientId, products } = req.body;

    // Validação
    if (!clientId || !Array.isArray(products) || products.length === 0) {
        return res.status(400).json({ error: 'ID do cliente e produtos são necessários' });
    }

    try {
        // Buscar os preços dos produtos
        const productData = await prisma.product.findMany({
            where: { id: { in: products } },
            select: { price: true },
        });

        // Calcular o total
        const total = productData.reduce((acc, product) => acc + product.price, 0);

        // Atualizar a venda
        const sale = await prisma.sale.update({
            where: { id: Number(id) },
            data: {
                clientId,
                total,
                products: { set: products.map(productId => ({ id: productId })) },
            },
        });

        res.json(sale);
    } catch (error) {
        console.error("Erro ao atualizar venda:", error);
        res.status(500).json({ error: 'Erro ao atualizar venda' });
    }
});

// Rota de deletar uma venda e atualizar o caixa
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        // Buscar a venda para obter o valor total
        const sale = await prisma.sale.findUnique({ where: { id: Number(id) } });

        if (!sale) {
            return res.status(404).json({ error: 'Venda não encontrada' });
        }

        // Subtrair o valor da venda do caixa
        const caixa = await prisma.caixa.findFirst();
        if (caixa) {
            await prisma.caixa.update({
                where: { id: caixa.id },
                data: { valor: { decrement: sale.total } } // Subtrai o valor da venda
            });
        } else {
            console.error("Caixa não encontrado. Certifique-se de que ele foi criado.");
            return res.status(500).json({ error: "Erro ao atualizar caixa" });
        }

        // Excluir a venda
        await prisma.sale.delete({ where: { id: Number(id) } });

        res.status(204).send();
    } catch (error) {
        console.error("Erro ao deletar venda:", error);
        res.status(500).json({ error: 'Erro ao deletar venda' });
    }
});

export default router;
