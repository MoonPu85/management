const express = require('express');
const bodyPerser = require('body-parser');
const app = express();
const port = process.env.PORT || 5000;
const fs = require('fs');

app.use(bodyPerser.json());
app.use(bodyPerser.urlencoded({ extended: true}));

const data = fs.readFileSync('./database.json');
const conf = JSON.parse(data);
const mysql = require('mysql');

const multer = require('multer');
const upload = multer({dest : './upload'})

const connecetion = mysql.createConnection({
    host : conf.host,
    user: conf.user,
    password: conf.password,
    port : conf.port,
    database :  conf.database


});
connecetion.connect();

app.get('/api/customers', (req,res) => {
    connecetion.query(
        " SELECT * FROM CUSTOMER WHERE isDeleted = 0",
        (err, rows, fields) => {  
    res.send(rows);

        }
    );
});
app.use('/image', express.static('./upload'));

app.post('/api/customers', upload.single('image'), (req, res) => {
    let sql = 'INSERT INTO CUSTOMER VALUES (null, ?, ?, ?, ?, ?, ?, now(), 0)';
    let image = 'http://localhost:5000/image/' + req.file.filename;
    let name = req.body.name;
    let Type = req.body.Type;
    let major = req.body.major;
    let address = req.body.address;
    let phone = req.body.phone;
    let params = [image, name, Type, major, address, phone];
    connecetion.query(sql, params,
        (err, rows, fields) => {
            res.send(rows);
            console.log(err);
           

           
        }
    )
});

app.delete('/api/customers/:id', (req, res) => {
    let sql = 'UPDATE CUSTOMER SET isDeleted = 1 WHERE id = ?';
    let params = [req.params.id];
    connecetion.query(sql, params,
        (err, rows, fields) => {
            res.send(rows);
        }
    )
});

const server = app.listen(port, () => {
    console.log('Express listening on port', port);
});