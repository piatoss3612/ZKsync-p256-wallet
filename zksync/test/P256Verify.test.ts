import { expect } from "chai";
import { getWallet, LOCAL_RICH_WALLETS } from "../deploy/utils";
import { ec } from "elliptic";
import { randomBytes } from "crypto";
import { keccak256 } from "ethers";
import { Wallet } from "zksync-ethers";

const P256VERIFY_CONTRACT_ADDRESS =
  "0x0000000000000000000000000000000000000100";
const ONE =
  "0x0000000000000000000000000000000000000000000000000000000000000001";
const P256_GROUP_ORDER =
  "0xffffffff00000000ffffffffffffffffbce6faada7179e84f3b9cac2fc632551";

const padLeft = (value: string, length: number) => {
  return value.padStart(length, "0");
};

describe("P256Verify", function () {
  let wallet: Wallet;
  let correctDigest: string;
  let correctX: string;
  let correctY: string;
  let correctR: string;
  let correctS: string;

  function compileSignature(options: {
    digest?: string;
    x?: string;
    y?: string;
    r?: string;
    s?: string;
  }) {
    const {
      digest: providedDigest,
      x: providedX,
      y: providedY,
      r: providedR,
      s: providedS,
    } = options;

    const digest = providedDigest || correctDigest;
    const x = providedX || correctX;
    const y = providedY || correctY;
    const r = providedR || correctR;
    const s = providedS || correctS;

    // Concatenate the digest, r, s, x and y.
    // Note that for r,s,x,y we need to remove the 0x prefix
    return digest + r.slice(2) + s.slice(2) + x.slice(2) + y.slice(2);
  }

  before(async function () {
    wallet = getWallet(LOCAL_RICH_WALLETS[0].privateKey);

    const p256 = new ec("p256");
    const keyPair = p256.genKeyPair();

    const message = randomBytes(128);
    correctDigest = keccak256(message);

    const signature = keyPair.sign(correctDigest.slice(2));

    correctR = "0x" + padLeft(signature.r.toString(16), 64);
    correctS = "0x" + padLeft(signature.s.toString(16), 64);

    const publicKey = keyPair.getPublic();

    correctX = "0x" + padLeft(publicKey.getX().toString(16), 64);
    correctY = "0x" + padLeft(publicKey.getY().toString(16), 64);
  });

  it("Should verify the valid signature", async function () {
    const signatureHex = compileSignature({});

    const result = await wallet.call({
      to: P256VERIFY_CONTRACT_ADDRESS,
      data: signatureHex,
    });

    expect(result).to.equal(ONE);
  });

  it("Should fail to verify the invalid input", async function () {
    const result = await wallet.call({
      to: P256VERIFY_CONTRACT_ADDRESS,
      data: "0xdeadc0de",
    });

    expect(result).to.equal("0x");
  });

  it("Should reject large s/r, which are not in the group", async () => {
    for (const param of ["r", "s"]) {
      const result = await wallet.call({
        to: P256VERIFY_CONTRACT_ADDRESS,
        data: compileSignature({ [param]: P256_GROUP_ORDER }),
      });

      expect(result).to.eq("0x");
    }
  });

  it("Should reject when calldata is longer than 160 bytes", async () => {
    const result = await wallet.call({
      to: P256VERIFY_CONTRACT_ADDRESS,
      // The signature is valid and yet the input is too long
      data: compileSignature({}) + "00",
    });

    expect(result).to.eq("0x");
  });

  it("Signature malleability is permitted", async () => {
    const newS = BigInt(P256_GROUP_ORDER) - BigInt(correctS);
    const newSHex = "0x" + padLeft(newS.toString(16), 64);

    const result = await wallet.call({
      to: P256VERIFY_CONTRACT_ADDRESS,
      // The signature is valid and yet the input is too long
      data: compileSignature({ s: newSHex }),
    });

    expect(result).to.eq(ONE);
  });

  it("secp256k1 signature should be rejected", async () => {
    const k1 = new ec("secp256k1");
    const keyPair = k1.genKeyPair();

    const message = randomBytes(128);
    const digest = keccak256(message);

    const signature = keyPair.sign(digest.slice(2));

    const r = "0x" + padLeft(signature.r.toString(16), 64);
    const s = "0x" + padLeft(signature.s.toString(16), 64);

    const publicKey = keyPair.getPublic();

    const x = "0x" + padLeft(publicKey.getX().toString(16), 64);
    const y = "0x" + padLeft(publicKey.getY().toString(16), 64);

    const signatureHex = compileSignature({ digest, x, y, r, s });

    const result = await wallet.call({
      to: P256VERIFY_CONTRACT_ADDRESS,
      data: signatureHex,
    });

    expect(result).to.equal("0x");
  });
});
