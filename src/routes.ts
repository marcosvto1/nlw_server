import express from 'express';
import ClassesController from './controllers/ClassesController';
import ConnectionsController from './controllers/ConnectionsController';

const routes = express.Router();
const classesController = new ClassesController();
const connnectionsController = new ConnectionsController();

routes.get('/', (req, res) => {
    return res.json({message: 'Api Proffy'});
});

routes.post('/classes', classesController.create)
routes.get('/classes', classesController.index);

routes.post('/connections', connnectionsController.create);
routes.get('/connections', connnectionsController.index);

export default routes;