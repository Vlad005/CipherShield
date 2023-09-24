import { generateKeyPairSync, KeyPairKeyObjectResult, publicEncrypt, privateDecrypt } from 'crypto'
import { Business } from '../../utils/db';

export const generate_keys = (company_id: string): string => {
    const key_pair: KeyPairKeyObjectResult = generateKeyPairSync("rsa", {
        modulusLength: 2048,
    });

    const private_key: string = key_pair.privateKey.export({format: 'pem', type: 'pkcs1'}) as string;
    const public_key: string = key_pair.publicKey.export({format: 'pem', type: 'pkcs1'}) as string

    Business.findOneAndUpdate({_id: company_id }, {$set:{ pubKey: public_key}});
    // Adding public key to db should be here
    //console.log(`-- PUBLIC KEY FOR ${company_id}: ${public_key}`);

    return private_key;
}

export const encrypt_data = (data: string, public_key: string): string => {
    let data_buffer: Buffer = Buffer.from(data, 'utf-8');

    const encrypted_buffer: Buffer = publicEncrypt(public_key, data_buffer);
    const encrypted_data: string = encrypted_buffer.toString("base64");

    return encrypted_data;
}

export const decrypt_data = (encrypted_data: string, private_key: string): string => {
    let encrypted_buffer: Buffer = Buffer.from(encrypted_data, 'base64');

    const data_buffer: Buffer = privateDecrypt(private_key, encrypted_buffer);
    const data: string = data_buffer.toString("utf-8");

    return data;
}