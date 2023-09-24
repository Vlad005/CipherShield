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
      key: fs.readFileSync("server.key"),
      cert: fs.readFileSync("server.cert"),
    },
    app
  )
  .listen(3000, () => {
    console.log("Server running on https://localhost:3000/");
});

/*
-----BEGIN RSA PRIVATE KEY----- MIIEpQIBAAKCAQEAxbJL9x7YunLsRKU2+ISQdP6s5s9KeiyG7ZiZwJadgJkj/Ruc gsBPH4kZhqG7hipfuI/eORjSJbzlWku6QfxRVLJI20OhMoS9BlTTKK1la5fxfi0a n9L7dkwJpYVr5YIhlW9q8NGjaxNkvs5w2N9IEUcY5g6qWrqTFJKd30Kq9IpehMZW 6crrkUywlr9F1fRtjF1bIhxyP/IU2/H3gBw1meOrzLnHV0HCdYqqVjYh9XN5DhGB /mJgnwyXEjLuQipvd8VvGLZV7BISWYGN+T1lErKcYb7IEjPo4GC1TVA5wUhhusWm wmK0SC8/vGzJdxoh19hLT2nmT2fIdlQssGp+bQIDAQABAoIBAQCLN6alLJTEn79g C9RtJ7UunlWV6C3zYT3XPVowtB/P+ofMatBJhzFw7LQMCgKrVVW4+58rKB58ssv0 TVWpuAxyD2ac+cAfejg+qCdXAtxj60kFaK/SEtpAEQXOCOnVYlFSEXcGhSqGcc7F S01Oe9YdTKrs/zDZ2X9PwnvoR+NpdnZxqVwEqhxh1zziOYb47Q0MaHZHzuECV3ww xQSft9MEQ7ebCKXcssxZQtP9JTfgyfN6yERHYVghm0NOxCyKyqMH/u+n0LrdKU49 Wk2O8hqf5j2U46AFbD5juwNOti7Ft3ytFQW6wUB84PXa5xubJAgBEQfV+Uadstb8 RvK8XQBBAoGBAOYSoLt0fL1kPs0Q40kIQZnRkpNKE6jK7+7rln8RUiFSzj6UzY2J yI8JPFu8+I2hneX28ZExQ+ffELO7MJSEKRJZs5LZY1U9luwzQA9y0DmJkrAiER/m q74Z2HMnzuvbQBx+O78KOmDd/q3y2/f3RAa/JEK6/NmPX6TQ9Yw2qjmdAoGBANv5 pRAKIYP+ePsYWRaORh9a4xV0xQxCKtUiW1zksbDDixzZZnuBSYNSZRN7+S9Fo/MV MiEBt8WCfNQoVX+eDErWKJUz4Oy2gx4rT8t/423bDJmWJNtpvXmSJ7k8nHiJ+m8c /S234sVCyW4Mer517QUNWSyOwwlIi/ReQHZPoOcRAoGAI5gAK+ASqE5I9PrG3vab B4wHrCfKsNNsmT7zUodAeI1SARaOUnZdg9t+7gZnQaoePoSczMSdZ9L3x4aPNnrX y9H62R4uovJbVgF7yKgPlMc23W73zUKnkUp4VSB0f8K0wXO6FI0liPTvQMQQyeUE LjMGDhjVo2bt+hal1mJipXUCgYEAlWeZlKtM2DmeMez3lTpMpj80vP3yV8EZFmmf ZBhwF364nX+K+5d0Np1fyTwKovDJyfA7e++Owbc+0VoTt/nAn5OVPMFfo2bS50rD h5P1BEgi5q3zmpLW/hsmn8lq/PO6BH3L96FNhG04ImaXd4Tg1u2aA4lzLnr3k6Hw Zmru/gECgYEAuqMreu7J8zLsdvBlMHwuj962lKOZGynN/APaonKdD6JlGWPSNcnV Hfd33Q69Nc3MjpgsFHnb558AufCPIJl0eVjO7+epxocTT1eY+PakjgTAF/ekcMxh Wz5BsUIDY76S0uXRtl14PrB63jJZdJbkW+mmHqSNut4GhTSC1JxqnS4= -----END RSA PRIVATE KEY-----

-----BEGIN RSA PUBLIC KEY-----
MIIBCgKCAQEAxbJL9x7YunLsRKU2+ISQdP6s5s9KeiyG7ZiZwJadgJkj/RucgsBP
H4kZhqG7hipfuI/eORjSJbzlWku6QfxRVLJI20OhMoS9BlTTKK1la5fxfi0an9L7
dkwJpYVr5YIhlW9q8NGjaxNkvs5w2N9IEUcY5g6qWrqTFJKd30Kq9IpehMZW6crr
kUywlr9F1fRtjF1bIhxyP/IU2/H3gBw1meOrzLnHV0HCdYqqVjYh9XN5DhGB/mJg
nwyXEjLuQipvd8VvGLZV7BISWYGN+T1lErKcYb7IEjPo4GC1TVA5wUhhusWmwmK0
SC8/vGzJdxoh19hLT2nmT2fIdlQssGp+bQIDAQAB
-----END RSA PUBLIC KEY-----

Encrypted data:
b/IE+H1JrbeVbDdVvxOZfnaFtLs/hMoXFWsLmjml410v97l313F2jUj8FSKqfOOQu0YdK9VzNqQoODM6q/tyWOgnhskpah5cTpdzb8NX3ocDYubYo/FoL4wRFewsBWV+n/bL6ayxrsXuEqUEzY7KVWC8RkHaE1xYRRrOrfHieKw2BnOUQZcYR6SHae3fofCDYQ59VUwY07a+5OrVaXe3gMmn7MUmLAUiDePue2rfpyX77JqGrvkddiMa+wWGoZ18Sje7cWB4rSCHCJgXLoJYqzZpULDos9OI9qmHRfTwFR9BJ9fl5YXRtLeupZnJJLPJlKUNmZiJvMKZGKFWJ1eKxg==

localhost:8000/encrypt_data?encrypted_data='b/IE+H1JrbeVbDdVvxOZfnaFtLs/hMoXFWsLmjml410v97l313F2jUj8FSKqfOOQu0YdK9VzNqQoODM6q/tyWOgnhskpah5cTpdzb8NX3ocDYubYo/FoL4wRFewsBWV+n/bL6ayxrsXuEqUEzY7KVWC8RkHaE1xYRRrOrfHieKw2BnOUQZcYR6SHae3fofCDYQ59VUwY07a+5OrVaXe3gMmn7MUmLAUiDePue2rfpyX77JqGrvkddiMa+wWGoZ18Sje7cWB4rSCHCJgXLoJYqzZpULDos9OI9qmHRfTwFR9BJ9fl5YXRtLeupZnJJLPJlKUNmZiJvMKZGKFWJ1eKxg=='&private_key='-----BEGIN RSA PRIVATE KEY----- MIIEpQIBAAKCAQEAxbJL9x7YunLsRKU2+ISQdP6s5s9KeiyG7ZiZwJadgJkj/Ruc gsBPH4kZhqG7hipfuI/eORjSJbzlWku6QfxRVLJI20OhMoS9BlTTKK1la5fxfi0a n9L7dkwJpYVr5YIhlW9q8NGjaxNkvs5w2N9IEUcY5g6qWrqTFJKd30Kq9IpehMZW 6crrkUywlr9F1fRtjF1bIhxyP/IU2/H3gBw1meOrzLnHV0HCdYqqVjYh9XN5DhGB /mJgnwyXEjLuQipvd8VvGLZV7BISWYGN+T1lErKcYb7IEjPo4GC1TVA5wUhhusWm wmK0SC8/vGzJdxoh19hLT2nmT2fIdlQssGp+bQIDAQABAoIBAQCLN6alLJTEn79g C9RtJ7UunlWV6C3zYT3XPVowtB/P+ofMatBJhzFw7LQMCgKrVVW4+58rKB58ssv0 TVWpuAxyD2ac+cAfejg+qCdXAtxj60kFaK/SEtpAEQXOCOnVYlFSEXcGhSqGcc7F S01Oe9YdTKrs/zDZ2X9PwnvoR+NpdnZxqVwEqhxh1zziOYb47Q0MaHZHzuECV3ww xQSft9MEQ7ebCKXcssxZQtP9JTfgyfN6yERHYVghm0NOxCyKyqMH/u+n0LrdKU49 Wk2O8hqf5j2U46AFbD5juwNOti7Ft3ytFQW6wUB84PXa5xubJAgBEQfV+Uadstb8 RvK8XQBBAoGBAOYSoLt0fL1kPs0Q40kIQZnRkpNKE6jK7+7rln8RUiFSzj6UzY2J yI8JPFu8+I2hneX28ZExQ+ffELO7MJSEKRJZs5LZY1U9luwzQA9y0DmJkrAiER/m q74Z2HMnzuvbQBx+O78KOmDd/q3y2/f3RAa/JEK6/NmPX6TQ9Yw2qjmdAoGBANv5 pRAKIYP+ePsYWRaORh9a4xV0xQxCKtUiW1zksbDDixzZZnuBSYNSZRN7+S9Fo/MV MiEBt8WCfNQoVX+eDErWKJUz4Oy2gx4rT8t/423bDJmWJNtpvXmSJ7k8nHiJ+m8c /S234sVCyW4Mer517QUNWSyOwwlIi/ReQHZPoOcRAoGAI5gAK+ASqE5I9PrG3vab B4wHrCfKsNNsmT7zUodAeI1SARaOUnZdg9t+7gZnQaoePoSczMSdZ9L3x4aPNnrX y9H62R4uovJbVgF7yKgPlMc23W73zUKnkUp4VSB0f8K0wXO6FI0liPTvQMQQyeUE LjMGDhjVo2bt+hal1mJipXUCgYEAlWeZlKtM2DmeMez3lTpMpj80vP3yV8EZFmmf ZBhwF364nX+K+5d0Np1fyTwKovDJyfA7e++Owbc+0VoTt/nAn5OVPMFfo2bS50rD h5P1BEgi5q3zmpLW/hsmn8lq/PO6BH3L96FNhG04ImaXd4Tg1u2aA4lzLnr3k6Hw Zmru/gECgYEAuqMreu7J8zLsdvBlMHwuj962lKOZGynN/APaonKdD6JlGWPSNcnV Hfd33Q69Nc3MjpgsFHnb558AufCPIJl0eVjO7+epxocTT1eY+PakjgTAF/ekcMxh Wz5BsUIDY76S0uXRtl14PrB63jJZdJbkW+mmHqSNut4GhTSC1JxqnS4= -----END RSA PRIVATE KEY-----'
*/