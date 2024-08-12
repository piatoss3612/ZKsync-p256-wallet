# P256 Account

## Setup

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

(WIP)
