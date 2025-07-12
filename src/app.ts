import 'reflect-metadata';
import express from 'express';
import userRoutes from '../src/routes/user.route'

const app = express();
app.use(express.json());

app.get('/', (req, res) => {
    res.json('Hello World!');
});

const apiRouter = express.Router();
app.use('/api/v1', apiRouter);


apiRouter.use('/users', userRoutes);

export default app;