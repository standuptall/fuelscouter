const express = require('express')
const path = require('path')
const { Client } = require('pg');
const PORT = process.env.PORT || 5000
const https = require('https')


const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});
//client.connect();

client.query('SELECT table_schema,table_name FROM information_schema.tables;', (err, res) => {
  if (err) throw err;
  for (let row of res.rows) {
    console.log(JSON.stringify(row));
  }
  client.end();
});

express()
  .use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/index'))
  .get('/rifornimenti',async (request, response) => {
    try{
      const data = await getAll();
      response.send(data);
    }
    catch{
      response.send("Cannot send request");
    }
  })
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))

function getAll(){

  return new Promise((resolve, reject) => {
    const data = "province=PV&region=19";
    const options = {
      hostname: 'carburanti.mise.gov.it',
      port: 443,
      path: '/OssPrezziSearch/ricerca/localita',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }
    
    const req = https.request(options, res => {
      let body = "";
      console.log(`statusCode: ${res.statusCode}`)
    
      res.on('data', d => {
        body += d.toString("utf8");
      })
      res.on('end', function () {
        resolve(body);
      });
    })
    req.on('error', error => {
      reject(error);
    })
    req.write(data);
    req.end()
  });  

  
}

