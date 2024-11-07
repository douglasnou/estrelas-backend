import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import clientRoutes from "./routes/clientRoute.js";
import productRoutes from "./routes/productRoute.js";
import saleRoutes from "./routes/saleRoute.js";
import paymentRoutes from "./routes/paymentRoute.js";
import expenseRoutes from "./routes/expenseRoute.js";
import caixaRoutes from "./routes/caixaRoute.js";
import { handlerError } from "./middleware/handlerError.js";

dotenv.config();

const app = express();
app.use(express.json());

app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));


app.use('/clientes', clientRoutes);
app.use('/produtos', productRoutes);
app.use('/vendas', saleRoutes);
app.use('/pagamentos', paymentRoutes);
app.use('/despesas', expenseRoutes);
app.use('/caixa', caixaRoutes);

app.use(handlerError)

app.listen(5000, ()=>{
    console.log("o servidor está ativo, a API está online.")
})