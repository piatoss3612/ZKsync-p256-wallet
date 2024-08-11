import { expect } from "chai";
import { getWallet, deployContract, LOCAL_RICH_WALLETS } from "../deploy/utils";
import { Contract, EIP712Signer, types, Wallet } from "zksync-ethers";
import { ec } from "elliptic";
import { keccak256, parseEther, randomBytes } from "ethers";
import { DEFAULT_GAS_PER_PUBDATA_LIMIT } from "zksync-ethers/build/utils";
import { Transaction } from "zksync-ethers/build/types";
import * as hre from "hardhat";
import { Deployer } from "@matterlabs/hardhat-zksync";

const EIP1271_MAGIC_VALUE = "0x1626ba7e";

const padLeft = (value: string, length: number) => {
  return value.padStart(length, "0");
};

const concatSig = (signature: ec.Signature) => {
  const r = padLeft(signature.r.toString("hex"), 64);
  const s = padLeft(signature.s.toString("hex"), 64);

  return "0x" + r + s;
};

describe("P256Account", function () {
  let wallet: Wallet;
  let p256KeyPair: ec.KeyPair;
  let greeter: Contract;

  const deployAccount = async (
    contractArtifactName: string,
    constructorArguments?: any[]
  ): Promise<Contract> => {
    const deployer = new Deployer(hre, wallet);
    const artifact = await deployer.loadArtifact(contractArtifactName);
    return await deployer.deploy(
      artifact,
      constructorArguments,
      "createAccount"
    );
  };

  before(async function () {
    wallet = getWallet(LOCAL_RICH_WALLETS[0].privateKey);

    const p256 = new ec("p256");
    p256KeyPair = p256.genKeyPair();

    const greeting = "Hello world!";
    greeter = await deployContract("Greeter", [greeting], {
      wallet,
      silent: true,
    });

    expect(await greeter.greet()).to.eq(greeting);
  });

  it("Should successfully set the public key on deployment", async function () {
    const publicKey = p256KeyPair.getPublic();
    const x = "0x" + padLeft(publicKey.getX().toString("hex"), 64);
    const y = "0x" + padLeft(publicKey.getY().toString("hex"), 64);
    const account = await deployAccount("P256Account", [x, y]);

    expect(await account.publicKey(0)).to.eq(x);
    expect(await account.publicKey(1)).to.eq(y);
  });

  it("Should successfully verify the signature", async function () {
    const publicKey = p256KeyPair.getPublic();
    const x = "0x" + padLeft(publicKey.getX().toString("hex"), 64);
    const y = "0x" + padLeft(publicKey.getY().toString("hex"), 64);
    const account = await deployAccount("P256Account", [x, y]);

    const message = randomBytes(128);
    const digest = keccak256(message);
    const signature = concatSig(p256KeyPair.sign(digest));

    const magic = await account.isValidSignature(digest, signature);

    expect(magic).to.eq(EIP1271_MAGIC_VALUE);
  });

  //   it("Should successfully set greeting with the account", async function () {
  //     const publicKey = p256KeyPair.getPublic();
  //     const x = "0x" + padLeft(publicKey.getX().toString("hex"), 64);
  //     const y = "0x" + padLeft(publicKey.getY().toString("hex"), 64);
  //     const account = await deployAccount("P256Account", [x, y]);

  //     const accountAddress = await account.getAddress();

  //     // fund the account
  //     await wallet.sendTransaction({
  //       to: accountAddress,
  //       value: parseEther("0.1"),
  //     });

  //     const provider = wallet.provider;

  //     const balance = await provider.getBalance(accountAddress);

  //     expect(balance).to.eq(parseEther("0.1"));

  //     // set greeting with the account
  //     const newGreeting = "Hello from P256Account!";

  //     let tx = await greeter.setGreeting.populateTransaction(newGreeting);

  //     tx = {
  //       ...tx,
  //       from: accountAddress,
  //       chainId: (await provider.getNetwork()).chainId,
  //       nonce: await provider.getTransactionCount(accountAddress),
  //       type: 113,
  //       gasPrice: await provider.getGasPrice(),
  //       gasLimit: BigInt(5000000),
  //       value: BigInt(0),
  //       customData: {
  //         gasPerPubdata: DEFAULT_GAS_PER_PUBDATA_LIMIT,
  //       } as types.Eip712Meta,
  //     };

  //     tx.gasLimit = await provider.estimateGas(tx);

  //     const digest = EIP712Signer.getSignedDigest(tx);
  //     const signature = concatSig(p256KeyPair.sign(digest));

  //     tx.customData = {
  //       ...tx.customData,
  //       customSignature: signature,
  //     };

  //     const sentTx = await provider.broadcastTransaction(
  //       Transaction.from(tx).serialized
  //     );

  //     const receipt = await sentTx.wait();
  //   });
});
