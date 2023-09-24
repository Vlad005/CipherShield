import express, { Request, Response , Application } from 'express';
let fs = require("fs");
let https = require("https");

import { generate_keys, encrypt_data, decrypt_data } from './server/helpers/encrypt_helpers';

const app: Application = express();
const port: number = 8000;

app.use(express.json())

app.get('/get_keys', (req: Request, res: Response) => {
  const private_key = generate_keys(1);
  res.send(`Private key: ${private_key}`);
});

app.get('/encrypt_data', (req: Request, res: Response) => {
  if(req.query?.data, req.query?.company_id){
      // Getting public key from db should be here
    const public_key: string = `-----BEGIN RSA PUBLIC KEY-----\nMIIBCgKCAQEAxbJL9x7YunLsRKU2+ISQdP6s5s9KeiyG7ZiZwJadgJkj/RucgsBPH4kZhqG7hipfuI/eORjSJbzlWku6QfxRVLJI20OhMoS9BlTTKK1la5fxfi0an9L7dkwJpYVr5YIhlW9q8NGjaxNkvs5w2N9IEUcY5g6qWrqTFJKd30Kq9IpehMZW6crrkUywlr9F1fRtjF1bIhxyP/IU2/H3gBw1meOrzLnHV0HCdYqqVjYh9XN5DhGB/mJgnwyXEjLuQipvd8VvGLZV7BISWYGN+T1lErKcYb7IEjPo4GC1TVA5wUhhusWmwmK0SC8/vGzJdxoh19hLT2nmT2fIdlQssGp+bQIDAQAB\n-----END RSA PUBLIC KEY-----`;

    const data = req.query?.data || '';
    const encrypted_data: string = encrypt_data(data.toString(), public_key);
    res.send(`Encrypted string for company ${req.query?.company_id}: ${encrypted_data}`);
  }
  else{
    res.status(401).send('Invalid query. Request should contain `data` that needs to be encrypted and `company_id`');
  }
});

app.post('/decrypt_data', (req: Request, res: Response) => {
  res.header('Access-Control-Allow-Origin', '*');
  if(req.body?.encrypted_data, req.body?.private_key){
    const encrypted_data = req.body?.encrypted_data || '';
    const private_key = req.body?.private_key || '';

    const data: string = decrypt_data(encrypted_data.toString(), private_key.toString());
    res.send(`Original string was: ${data}`);
  }
  else{
    res.status(401).send('Invalid query. Request should contain `encrypted_data` that needs to be decrypted and `private_key`');
  }
});

https
  .createServer(
    {
      key: fs.readFileSync("SSL/server.key"),
      cert: fs.readFileSync("SSL/server.cert"),
    },
    app
  )
  .listen(3000, () => {
    console.log("Server running on https://localhost:3000/");
});