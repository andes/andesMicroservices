import { initAPI } from '../bootstrap/initialization';
import * as express from 'express';

const app = express();
const router = express.Router();

router.get('/example', (req, res) => {
    res.json({msg: 'This is an example'})
});

initAPI(app, router);

let port = process.env.PORT ||  7777;
let server = app.listen(port, () => console.log(port));
