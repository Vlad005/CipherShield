import './jwt'
import { decodeToken } from './jwt'
const { Business } = require("./utils/db"); 

export const UpdatePublicKey = async (token:string, pkey: string) => {
    const dToken = decodeToken(token);
    await Business.findOneAndUpdate({_id: dToken.id }, {$set:{ pubKey: pkey}});
}