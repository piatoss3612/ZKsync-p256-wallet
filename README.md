# ZKsync P256 Wallet

This guide is for developers who want to create a wallet with P256 elliptic curve and ZKsync native account abstraction.

## Table of Contents

- [Overview](#overview)
- [Guide Sections](#guide-sections)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [License](#license)
- [Contributions](#contributions)

## Overview

This guide will cover the following topics:

- [EIP-7212](https://eips.ethereum.org/EIPS/eip-7212)
- EIP-7212 Implementation on ZKsync
- Smart Contract Account with P256 Signature Verification
- WebAuthn Integration
- Frontend Integration

## Guide Sections

| Section                                                                                                                          | Description                                                                          |
| -------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| [EIP-7212 and its implementation on ZKsync](https://github.com/piatoss3612/ZKsync-p256-wallet/tree/01.P256Verify)                | This section will cover the EIP-7212 and its implementation on ZKsync.               |
| [Smart Contract Account with P256 Signature Verification](https://github.com/piatoss3612/ZKsync-p256-wallet/tree/02.P256Account) | This section will cover the Smart Contract Account with P256 Signature Verification. |

## Prerequisites

- [Node.js](https://nodejs.org/en/download/) (v18.x or later)
- [Yarn](https://yarnpkg.com/getting-started/install) (v1.22.x or later)
- [zksync-cli](https://docs.zksync.io/build/zksync-cli) (v1.8.2)

## Getting Started

1. Clone the repository:

```bash
$ git clone https://github.com/piatoss3612/ZKsync-p256-wallet.git
```

2. Navigate to the project directory:

```bash
$ cd ZKsync-p256-wallet
```

3. Checkout to the branch you want to start with:

```bash
$ git checkout 01.P256Verify
```

4. Install the dependencies:

```bash
$ cd zksync && yarn install
```

5. Run the tests:

```bash
$ yarn test
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contributions

Since this guide has been written while studying the ZKsync protocol, there may be some mistakes or misunderstandings. Please feel free to correct me if you find any. 🙏

If you have any suggestions or improvements, feel free to create an issue or a pull request. This project is open for contributions. 🚀
