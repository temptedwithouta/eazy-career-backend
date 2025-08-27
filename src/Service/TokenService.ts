import jose from "jose";
import fs from "fs/promises";
import crypto from "crypto";
import dotenv from "dotenv";
import Util from "../Util/Util";

export default class TokenService {
  public generateAuthToken = async (header: jose.JWTHeaderParameters, payload: jose.JWTPayload): Promise<string> => {
    await this.generateTokenKey();

    const jwk: jose.JWK = await this.generateJwks();

    await Util.isFileExist(`Key/PrivateKey.pem`);

    const privatePem = await fs.readFile(`${__dirname}/../Key/PrivateKey.pem`, "utf-8");

    dotenv.config();

    const privateKey = await jose.importPKCS8(privatePem, `${process.env.JWT_ALG}`);

    const jwt = new jose.SignJWT(payload).setProtectedHeader({ ...header, kid: jwk.kid }).sign(privateKey);

    return jwt;
  };

  private generateTokenKey = async (): Promise<void> => {
    await Util.isFileExist(`Key/PublicKey.pem`);

    const publicPem: string = await fs.readFile(`${__dirname}/../Key/PublicKey.pem`, "utf-8");

    await Util.isFileExist(`Key/PrivateKey.pem`);

    const privatePem: string = await fs.readFile(`${__dirname}/../Key/PrivateKey.pem`, "utf-8");

    if (publicPem.length && privatePem.length) {
      return;
    }

    dotenv.config();

    const { publicKey, privateKey }: { publicKey: jose.CryptoKey; privateKey: jose.CryptoKey } = await jose.generateKeyPair(`${process.env.JWT_ALG}`, {
      extractable: true,
    });

    const pkcs8Pem: string = await jose.exportPKCS8(privateKey);

    const spkiPem: string = await jose.exportSPKI(publicKey);

    await fs.writeFile(`${__dirname}/../Key/PrivateKey.pem`, pkcs8Pem);

    await fs.writeFile(`${__dirname}/../Key/PublicKey.pem`, spkiPem);
  };

  private generateJwks = async (): Promise<jose.JWK> => {
    await Util.isFileExist(`Key/PublicKey.pem`);

    const publicPem: string = await fs.readFile(`${__dirname}/../Key/PublicKey.pem`, "utf-8");

    const publicKey: jose.CryptoKey = await jose.importSPKI(publicPem, `${process.env.JWT_ALG}`);

    await Util.isFileExist(`Key/jwks.json`);

    const jwksJson: string = await fs.readFile(`${__dirname}/../Key/jwks.json`, "utf-8");

    const jwk: jose.JWK = await jose.exportJWK(publicKey);

    dotenv.config();

    jwk.alg = `${process.env.JWT_ALG}`;

    jwk.use = "sig";

    const kid = crypto
      .createHash("sha256")
      .update(JSON.stringify({ ...jwk }))
      .digest("base64url");

    jwk.kid = kid;

    const jwks: { keys: jose.JWK[] } = JSON.parse(jwksJson);

    if (!jwks.keys.filter((item) => item.kid === jwk.kid).length) {
      await fs.writeFile(`${__dirname}/../Key/jwks.json`, JSON.stringify({ ...jwks, keys: [...jwks.keys, jwk] }));
    }

    return jwk;
  };
}
