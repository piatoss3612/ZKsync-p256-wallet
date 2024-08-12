# ZKsync-p256-wallet

## Initialization

```bash
$ npm i -g zksync-cli
$ npx zksync-cli create --project contracts --template hardhat_solidity zksync
Using Hardhat + Solidity template
? Private key of the wallet responsible for deploying contracts (optional) ****************************************************************
? Package manager yarn

Setting up template in /home/piatoss/project/ZKsync-p256-wallet/zksync...
✔ Cloned template
✔ Environment variables set up
✔ Dependencies installed

🎉 All set up! 🎉

--------------------------

Navigate to your project: cd zksync

Directory Overview:
  - Contracts: /contracts
  - Deployment Scripts: /deploy

Commands:
  - Compile your contracts: yarn compile
  - Deploy your contract: yarn deploy
    - Tip: You can use the --network option to specify the network to deploy to.

Further Reading:
  - Check out the README file in the project location for more details: zksync/README.md

--------------------------
```

## Dependencies

```bash
$ yarn add -D elliptic @types/elliptic
```

## Test

```bash
$ yarn test --grep P256
yarn run v1.22.22
$ hardhat test --network hardhat --grep P256


  P256Verify
    ✔ Should verify the valid signature
    ✔ Should fail to verify the invalid input
    ✔ Should reject large s/r, which are not in the group
    ✔ Should reject when calldata is longer than 160 bytes
    ✔ Signature malleability is permitted


  5 passing (279ms)

Done in 3.19s.
```

## Account

- `enableEraVMExtensions` is required to compile the contract interacting with the system contracts
- Modify `version` to the latest version of the zkvm compiler

```typescript
const config: HardhatUserConfig = {
  defaultNetwork: "zkSyncSepoliaTestnet",
  networks: {
    ...
  },
  zksolc: {
    version: "latest",
    settings: {
      // find all available options in the official documentation
      // https://era.zksync.io/docs/tools/hardhat/hardhat-zksync-solc.html#configuration
      enableEraVMExtensions: true,
    },
  },
  solidity: {
    version: "0.8.24",
  },
};
```

### Dependencies

```bash
$ yarn add -D @nomicfoundation/hardhat-chai-matchers
```

### Test

```bash
$ yarn test --grep P256Account
yarn run v1.22.22
$ hardhat test --network hardhat --grep P256Account


  P256Account
    ✔ Should successfully set the public key on deployment (1039ms)
    ✔ Should successfully verify the signature (373ms)
    ✔ Should successfully set greeting with the account (764ms)
    ✔ Signature malleability is permitted (705ms)
    ✔ Should reject replay attack using signature malleability (707ms)


  5 passing (4s)

Done in 7.77s.
```
