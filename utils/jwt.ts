import jwt, { JwtPayload, Secret } from "jsonwebtoken"

export const createToken = (id: string): string => {
    let token = jwt.sign({id}, process.env.JWT_SECRET as Secret, {expiresIn: '1h'});
    return token;
}

export const decodeToken = (token:string) : JwtPayload => {
    let decoded = jwt.verify(token, process.env.JWT_SECRET as Secret) as JwtPayload;
    return decoded;
}