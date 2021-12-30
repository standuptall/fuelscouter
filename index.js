const express = require('express')
const path = require('path')
const { Client } = require('pg');
const PORT = process.env.PORT || 5000
const https = require('https')


const client = new Client({
  connectionString: "postgres://veygzbyrkfqcgw:1f9fde171acd359664ff1f154ae9562610a02717e2b9ca9f30f5ad690f885f10@ec2-54-195-246-55.eu-west-1.compute.amazonaws.com:5432/d1okto102vhhgg",
  ssl: {
    rejectUnauthorized: false
  }
});
client.connect();

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
      const data = await getAll(request.query.province,request.query.region);
      response.set('Access-Control-Allow-Origin', '*');
      response.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
      response.set('Access-Control-Allow-Headers', '*');
      response.set('Access-Control-Allow-Credentials', true);
      response.send(data);
    }
    catch(error){
      console.log(error)
      response.send("Cannot send request");
    }
  })
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))

function getAll(province,region){

  return new Promise((resolve, reject) => {
    const data = `province=${province}&region=${region}`;
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

