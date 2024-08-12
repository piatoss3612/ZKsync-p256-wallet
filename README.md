# EIP-7212 and its Implementation in ZKsync

## Overview

In this guide, we will cover the following topics:

1. **EIP-7212: Precompile for secp256r1 Curve Support**
2. **Implementation of EIP-7212 in ZKsync**
3. **Testing the P256Verify Contract**

---

## EIP-7212: Precompile for secp256r1 Curve Support

[EIP-7212: Precompile for secp256r1 Curve Support](https://eips.ethereum.org/EIPS/eip-7212)

### **Abstract**

This proposal aims to create a precompiled contract that performs signature verification on the secp256r1 elliptic curve using message hashes, the `r` and `s` values of the signature, and the `x` and `y` values of the public key as parameters.

> **Precompiled Contract:** A special type of smart contract executed not by the EVM but by precompiled code at the blockchain node level. It is used to perform specific functions more efficiently and at a fixed cost, regardless of the parameter size. Examples include `ecrecover`, `sha256`, and `ripemd160`.

### **secp256r1 vs. secp256k1**

- **secp256r1** is a standardized curve by NIST and has a similar security level to **secp256k1**, but **the input parameters differ**, making the signature verification process incompatible between the two.
- **secp256k1** is the curve used in Ethereum's `ecrecover` precompiled contract, which allows signature verification at a low gas cost (3,000 gas).
- In contrast, **secp256r1** requires a separate smart contract implementation, which demands more gas.

#### **Parameter Comparison**

| **Parameter**                 | **secp256r1**                                                                                                                            | **secp256k1**                                                                                                                            |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| **Curve Equation**            | y² ≡ x³ + ax + b                                                                                                                         | y² ≡ x³ + ax + b                                                                                                                         |
| **Prime Field Modulus (p)**   | 0xffffffff00000001000000000000000000000000ffffffffffffffffffffffff                                                                       | 0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2f                                                                       |
| **Curve Coefficient (a)**     | 0xffffffff00000001000000000000000000000000fffffffffffffffffffffffc                                                                       | 0x0                                                                                                                                      |
| **Curve Coefficient (b)**     | 0x5ac635d8aa3a93e7b3ebbd55769886bc651d06b0cc53b0f63bce3c3e27d2604b                                                                       | 0x7                                                                                                                                      |
| **Base Point (G)**            | (0x6b17d1f2e12c4247f8bce6e563a440f277037d812deb33a0f4a13945d898c296, 0x4fe342e2fe1a7f9b8ee7eb4a7c0f9e162bce33576b315ececbb6406837bf51f5) | (0x79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798, 0x483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d4b8) |
| **Order of the Subgroup (n)** | 0xffffffff00000000ffffffffffffffffbce6faada7179e84f3b9cac2fc632551                                                                       | 0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141                                                                       |
| **Cofactor (h)**              | 0x1                                                                                                                                      | 0x1                                                                                                                                      |

- **Curve Equation:** Elliptic curves are mathematically represented as **y² ≡ x³ + ax + b**. This equation defines the shape of the curve and is used in cryptographic algorithms.
- **Prime Field Modulus (p):** The size of the finite field in which the curve is defined. `p` limits the range within which all `x` and `y` coordinates on the curve are represented as integers.
- **Curve Coefficients (a and b):** These constants define the mathematical properties of the elliptic curve. **a** and **b** determine the slope and shape of the curve, and each elliptic curve has unique values.
- **Base Point (G):** A specific point on the elliptic curve used as the starting point for cryptographic operations. `G` is typically the basis for generating and verifying signatures on the curve.
- **Order of the Subgroup (n):** The number of times the base point `G` can be added to itself before returning to the starting point. `n` plays a crucial role in signature algorithms and determines the security of the curve.
- **Cofactor (h):** The ratio of the total number of points on the curve to the order of the subgroup `n`. The cofactor indicates how much the subgroup covers the entire curve and is generally set to 1 or 2 to enhance security.

<details>
<summary>Why parameters of secp256r1 and secp256k1 affect signature verification?</summary>

Consider a simple number `x = 50`. Let's say we're performing a modular operation where we divide `x` by different primes, similar to how `secp256r1` and `secp256k1` use different prime field moduli:

- If we use a prime modulus `p1 = 7`, the result of `x mod p1` is:

```
50 mod 7 = 1
```

- If we use a different prime modulus `p2 = 11`, the result of `x mod p2` is:

```
50 mod 11 = 6
```

As you can see, the same number `x` produces different results depending on the prime modulus used. In elliptic curve cryptography, this difference in modulus directly influences the result of the mathematical operations on the curve, leading to variations in the signature verification process.

In the case of `secp256r1` and `secp256k1`, the different prime field moduli, curve coefficients, and base points result in distinct mathematical operations during signing and verification. Therefore, a signature generated using `secp256r1` parameters cannot be directly verified using `secp256k1` parameters, and vice versa.

</details>

### **Importance of secp256r1**

- **secp256r1** is widely used in modern devices such as **Apple's Secure Enclave**, **WebAuthn**, and **Android Keystore**.
- These features protect private keys in a physically separate, secure environment and are further enhanced by additional security measures like biometric authentication (Face ID, fingerprint recognition).
- As a result, managing private keys using these devices is generally more secure than traditional wallet software.

### **Integration with Account Abstraction**

- In Account Abstraction, **smart contract accounts (SCA)** can be programmed, allowing them to use **various signature algorithms** beyond the single-signature method of EOAs (Externally Owned Accounts).
- This enables users to leverage the security features of their devices to sign transactions for their smart contract accounts more conveniently and securely.
- For example, users can create a smart contract account and sign transactions using biometric authentication without needing to install a separate wallet app, making Ethereum-compatible networks easier and safer to use.

### **Conclusion**

- secp256r1 is a widely used elliptic curve in modern devices, and its introduction to the Ethereum ecosystem could enable more secure and efficient signature verification.
- The introduction of a **precompiled contract** could reduce the gas cost (3,450 gas) of secp256r1-based signature verification and enhance compatibility with a broader ecosystem.
- This change would allow users to leverage the security features of everyday devices like smartphones to sign Ethereum transactions more securely and conveniently, greatly improving the accessibility and usability of Ethereum and giving users more confidence in using the ecosystem.

<!-- 접은글 -->
<details>
<summary>Why Did Satoshi Nakamoto and Vitalik Buterin Choose secp256k1 Over secp256r1?</summary>

**1. Bitcoin**

- **Bitcoin's Philosophy:** Satoshi Nakamoto aimed to create a system independent of government or institutional interference when designing Bitcoin. secp256r1 is standardized by NIST, a U.S. government agency, which raised some concerns about its reliability within certain communities. At that time, there were **fears of a potential backdoor in NIST standards**, and Satoshi may have opted for a non-NIST standard to avoid these concerns.
- **Faster Calculations and Optimization:** secp256k1 is known to offer faster and more efficient calculations for specific cryptographic tasks (e.g., Elliptic Curve Digital Signature Algorithm, ECDSA). This was a crucial performance factor in the Bitcoin network, making secp256k1 a likely choice due to its emphasis on efficiency.

**2. Ethereum**

- **Compatibility with Bitcoin:** Vitalik Buterin sought to maintain some level of compatibility with Bitcoin when designing Ethereum. This allowed Ethereum to leverage the lessons learned from Bitcoin while offering more functionality. Using the secp256k1 curve, which was already proven in Bitcoin, helped secure compatibility and trust.
- **Community Trust:** By the time Ethereum was launched, secp256k1 had already established its safety and trust within the cryptocurrency community through its use in Bitcoin. Vitalik's decision to adopt secp256k1 helped maintain this trust and facilitated the early adoption of Ethereum.
</details>

---

## **Implementation of EIP-7212 in ZKsync**

EIP-7212 has been rebranded as RIP-7212 (Rollup Improvement Proposal) to enhance Ethereum's rollup ecosystem and has been implemented in several rollups. This section explores the implementation of EIP-7212 in ZKsync.

In early June, ZKsync introduced support for the secp256r1 curve with a precompiled contract through its [v24 upgrade](https://github.com/zkSync-Community-Hub/zksync-developers/discussions/519). Let's look at the precompiled contract code and set up a testing environment to see how to interact with it.

### **P256Verify**

The precompiled contract is named 'P256Verify', where 'P256' refers to the standardized name for the secp256r1 curve. The [contract code](https://github.com/matter-labs/era-contracts/blob/main/system-contracts/contracts/precompiles/P256Verify.yul) is written in Yul, a low-level language instead of Solidity.

```yul
/**
 * @author Matter Labs
 * @custom:security-contact security@matterlabs.dev
 * @notice The contract that emulates RIP-7212's P256VERIFY precompile.
 * @dev It uses `precompileCall` to call the zkEVM built-in precompiles.
 */
object "P256Verify" {
    code {
        return(0, 0)
    }
    object "P256Verify_deployed" {
        code {
            ////////////////////////////////////////////////////////////////
            //                      CONSTANTS
            ////////////////////////////////////////////////////////////////

            /// @dev The gas cost of processing V circuit precompile.
            function P256_VERIFY_GAS_COST() -> ret {
                ret := 12000
            }

            ////////////////////////////////////////////////////////////////
            //                      HELPER FUNCTIONS
            ////////////////////////////////////////////////////////////////

            /// @dev Packs precompile parameters into one word.
            /// Note: functions expect to work with 32/64 bits unsigned integers.
            /// Caller should ensure the type matching before!
            function unsafePackPrecompileParams(
                uint32_inputOffsetInWords,
                uint32_inputLengthInWords,
                uint32_outputOffsetInWords,
                uint32_outputLengthInWords,
                uint64_perPrecompileInterpreted
            ) -> rawParams {
                rawParams := uint32_inputOffsetInWords
                rawParams := or(rawParams, shl(32, uint32_inputLengthInWords))
                rawParams := or(rawParams, shl(64, uint32_outputOffsetInWords))
                rawParams := or(rawParams, shl(96, uint32_outputLengthInWords))
                rawParams := or(rawParams, shl(192, uint64_perPrecompileInterpreted))
            }

            /// @dev Executes the `precompileCall` opcode.
            function precompileCall(precompileParams, gasToBurn) -> ret {
                // Compiler simulation for calling `precompileCall` opcode
                ret := verbatim_2i_1o("precompile", precompileParams, gasToBurn)
            }

            ////////////////////////////////////////////////////////////////
            //                      FALLBACK
            ////////////////////////////////////////////////////////////////

            if iszero(eq(calldatasize(), 160)) {
                return(0, 0)
            }

            // Copy first 5 32-bytes words (the signed digest, r, s, x, y) from the calldata
            // to memory, from where secp256r1 circuit will read it.
            // The validity of the input as it is done in the internal precompile implementation.
            calldatacopy(0, 0, 160)

            let precompileParams := unsafePackPrecompileParams(
                0, // input offset in words
                5, // input length in words (the signed digest, r, s, x, y)
                0, // output offset in words
                2, // output length in words (internalSuccess, isValid)
                0  // No special meaning, secp256r1 circuit doesn't check this value
            )
            let gasToPay := P256_VERIFY_GAS_COST()

            // Check whether the call is successfully handled by the secp256r1 circuit
            let success := precompileCall(precompileParams, gasToPay)
            let internalSuccess := mload(0)

            switch and(success, internalSuccess)
            case 0 {
                return(0, 0)
            }
            default {
                // The circuits might write `0` to the memory, while providing `internalSuccess` as `1`, so
                // we double check here.
                let isValid := mload(32)
                if eq(isValid, 0) {
                    return(0, 0)
                }

                return(32, 32)
            }
        }
    }
}
```

1. **Signature Verification Without a Specific Function Call:** The logic is executed through the fallback mechanism rather than a specific function call. The calldata must be exactly 160 bytes in length, composed as follows:

- Digest (signed message) - 32 bytes
- Signature `r` value - 32 bytes
- Signature `s` value - 32 bytes
- Signer's public key `x` value - 32 bytes
- Signer's public key `y` value - 32 bytes

Only when a 160-byte data structure is passed in the calldata will the logic proceed. Otherwise, a 0 (empty byte array) is returned.

```yul
////////////////////////////////////////////////////////////////
//                      FALLBACK
////////////////////////////////////////////////////////////////

if iszero(eq(calldatasize(), 160)) {
    return(0, 0)
}

// Copy first 5 32-bytes words (the signed digest, r, s, x, y) from the calldata
// to memory, from where secp256r1 circuit will read it.
// The validity of the input as it is done in the internal precompile implementation.
calldatacopy(0, 0, 160)
```

2. **Set Parameters and Gas Cost for Precompile Call:** The parameters for the precompile call are set, and the gas cost required is retrieved.

```yul
let precompileParams := unsafePackPrecompileParams(
    0, // input offset in words
    5, // input length in words (the signed digest, r, s, x, y)
    0, // output offset in words
    2, // output length in words (internalSuccess, isValid)
    0  // No special meaning, secp256r1 circuit doesn't check this value
)
let gasToPay := P256_VERIFY_GAS_COST()
```

The gas required for the precompile call is 12,000, which is more than three times the 3,450 gas proposed in the EIP-7212 standard.

```yul
/// @dev The gas cost of processing V circuit precompile.
function P256_VERIFY_GAS_COST() -> ret {
    ret := 12000
}
```

3. **Return 0 If the Call or Signature Verification Fails:** If the precompile call fails or signature verification fails, 0 is returned. Even if the signature verification succeeds, a double-check is performed to ensure the signature is valid. If valid, the second return value (`isValid`) is returned as 1, which is converted to a byte32 value of '0x0000000000000000000000000000000000000000000000000000000000000001'.

```yul
// Check whether the call is successfully handled by the secp256r1 circuit
let success := precompileCall(precompileParams, gasToPay)
let internalSuccess := mload(0)

switch and(success, internalSuccess)
case 0 {
    return(0, 0)
}
default {
    // The circuits might write `0` to the memory, while providing `internalSuccess` as `1`, so
    // we double check here.
    let isValid := mload(32)
    if eq(isValid, 0) {
        return(0, 0)
    }

    return(32, 32)
}
```

#### **Summary**

- **Fallback Mechanism:** P256Verify is invoked via a fallback mechanism without requiring a specific function selector.
- **160-Byte Calldata:** The calldata must consist of the digest, `r`, `s`, `x`, and `y`, with a total length of 160 bytes.
- **Return Values:** If the signature is valid, 1 is returned; otherwise, 0 is returned.

### **Setting Up a Testing Environment**

1. **Install zksync-cli:** Install zksync-cli to initialize a ZKsync project and simulate transactions on a test node. If you don't have [Node.js](https://nodejs.org/en) installed, do so first.

```bash
$ npm i -g zksync-cli
```

2. **Create a Hardhat Project:** Run the following command to create a Hardhat project named "zksync". Set up your private key and choose your preferred package manager (Yarn is used in the following examples).

```bash
$ npx zksync-cli create --project contracts --template hardhat_solidity zksync
```

3. **Navigate to the Project Directory:**

```bash
$ cd zksync
```

4. **Install the elliptic Package:** Install the elliptic package, which supports elliptic curve cryptography and is necessary for generating private keys on the secp256r1 curve.

```bash
$ yarn add -D elliptic @types/elliptic
```

5. **Create a Test File:** Create a 'P256Verify.test.ts' file in the `test` directory and paste the following content.

```typescript
import { expect } from "chai";
import { getWallet, LOCAL_RICH_WALLETS } from "../deploy/utils";
import { ec } from "elliptic";
import { randomBytes } from "crypto";
import { keccak256, ZeroHash } from "ethers";
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

  it("Should reject the invalid signature", async function () {
    for (const param of ["r", "s"]) {
      const result = await wallet.call({
        to: P256VERIFY_CONTRACT_ADDRESS,
        data: compileSignature({ [param]: ZeroHash }),
      });

      expect(result).to.equal("0x");
    }
  });

  it("Should reject when the calldata is too short", async () => {
    const result = await wallet.call({
      to: P256VERIFY_CONTRACT_ADDRESS,
      data: "0xdeadc0de",
    });

    expect(result).to.equal("0x");
  });

  it("Should reject when calldata is longer than 160 bytes", async () => {
    const result = await wallet.call({
      to: P256VERIFY_CONTRACT_ADDRESS,
      // The signature is valid and yet the input is too long
      data: compileSignature({}) + "00",
    });

    expect(result).to.eq("0x");
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

  it("Signature malleability is permitted", async () => {
    const newS = BigInt(P256_GROUP_ORDER) - BigInt(correctS);
    const newSHex = "0x" + padLeft(newS.toString(16), 64);

    const result = await wallet.call({
      to: P256VERIFY_CONTRACT_ADDRESS,
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
```

### **Analyzing the Test Code**

#### **Constants**

```typescript
const P256VERIFY_CONTRACT_ADDRESS =
  "0x0000000000000000000000000000000000000100";
const ONE =
  "0x0000000000000000000000000000000000000000000000000000000000000001";
const P256_GROUP_ORDER =
  "0xffffffff00000000ffffffffffffffffbce6faada7179e84f3b9cac2fc632551";
```

- **P256VERIFY_CONTRACT_ADDRESS:** Address of the precompiled contract deployed on the ZKsync network.
- **ONE:** Value returned if the signature is valid.
- **P256_GROUP_ORDER:** The order of the secp256r1 curve.

#### **Test Initialization**

```typescript
let wallet: Wallet;
let correctDigest: string;
let correctX: string;
let correctY: string;
let correctR: string;
let correctS: string;

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
```

1. **Initialize the Wallet:** Initialize the wallet needed to call the precompiled contract, select the p256 elliptic curve, and generate a key pair.

```typescript
wallet = getWallet(LOCAL_RICH_WALLETS[0].privateKey);

const p256 = new ec("p256");
const keyPair = p256.genKeyPair();
```

2. **Generate a Random Message:** Create a random 128-byte message and generate its digest using the keccak256 hash function.

```typescript
const message = randomBytes(128);
correctDigest = keccak256(message);
```

3. **Generate a Signature:** Use the p256 key pair to sign the digest and store the `r` and `s` values.

```typescript
const signature = keyPair.sign(correctDigest.slice(2));

correctR = "0x" + padLeft(signature.r.toString(16), 64);
correctS = "0x" + padLeft(signature.s.toString(16), 64);
```

4. **Retrieve the Public Key:** Obtain the public key from the key pair and store the `x` and `y` values.

```typescript
const publicKey = keyPair.getPublic();

correctX = "0x" + padLeft(publicKey.getX().toString(16), 64);
correctY = "0x" + padLeft(publicKey.getY().toString(16), 64);
```

#### **Helper Functions**

- **padLeft Function:** This function adds padding to the left side of `r`, `s`, `x`, and `y` to maintain the correct format when converting them to hexadecimal strings.

```typescript
const padLeft = (value: string, length: number) => {
  return value.padStart(length, "0");
};
```

- **compileSignature Function:** This function constructs the calldata required to call the precompiled contract. It returns valid calldata of 160 bytes, consisting of the digest, `r`, `s`, `x`, and `y`. Optional parameters allow for creating invalid calldata as well.

```typescript
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

  return digest + r.slice(2) + s.slice(2) + x.slice(2) + y.slice(2);
}
```

#### **Test Case 1: Valid Signature**

Simulate a transaction on the test node using the wallet's call method. Since the signature verification logic is executed through the fallback, only the 160-byte calldata is required. If the calldata is valid, the precompiled contract will return 'ONE'.

```typescript
it("Should verify the valid signature", async function () {
  const signatureHex = compileSignature({});

  const result = await wallet.call({
    to: P256VERIFY_CONTRACT_ADDRESS,
    data: signatureHex,
  });

  expect(result).to.equal(ONE);
});
```

#### **Test Case 2: Invalid Signature**

If `r` or `s` is 0, the signature is invalid, and a zero-length byte array is returned.

```typescript
it("Should reject the invalid signature", async function () {
  for (const param of ["r", "s"]) {
    const result = await wallet.call({
      to: P256VERIFY_CONTRACT_ADDRESS,
      data: compileSignature({ [param]: ZeroHash }),
    });

    expect(result).to.equal("0x");
  }
});
```

#### **Test Case 3: Calldata Length Less Than 160**

If calldata less than 160 bytes is used to call the precompiled contract, a zero-length byte array is returned.

```typescript
it("Should reject when the calldata is too short", async () => {
  const result = await wallet.call({
    to: P256VERIFY_CONTRACT_ADDRESS,
    data: "0xdeadc0de",
  });

  expect(result).to.equal("0x");
});
```

```typescript
if iszero(eq(calldatasize(), 160)) {
    return(0, 0)
}
```

#### **Test Case 4: Calldata Length Greater Than 160**

If calldata longer than 160 bytes is used, a zero-length byte array is returned, just like when the length is less than 160.

```typescript
it("Should reject when calldata is longer than 160 bytes", async () => {
  const result = await wallet.call({
    to: P256VERIFY_CONTRACT_ADDRESS,
    data: compileSignature({}) + "00",
  });

  expect(result).to.eq("0x");
});
```

#### **Test Case 5: Values Greater Than or Equal to the Order of the Subgroup**

The `r` and `s` values of the signature must always be smaller than the order of the subgroup. If `r` or `s` is equal to or greater than the order, the signature is invalid, and a zero-length byte array is returned.

```typescript
it("Should reject large s/r, which are not in the group", async () => {
  for (const param of ["r", "s"]) {
    const result = await wallet.call({
      to: P256VERIFY_CONTRACT_ADDRESS,
      data: compileSignature({ [param]: P256_GROUP_ORDER }),
    });

    expect(result).to.eq("0x");
  }
});
```

#### **Test Case 6: Signature Malleability**

A valid signature can be generated by subtracting the signature's `s` value from the order of the subgroup `n`. Therefore, using `newS` instead of `s` still produces a valid signature, and 'ONE' is returned.

```typescript
it("Signature malleability is permitted", async () => {
  const newS = BigInt(P256_GROUP_ORDER) - BigInt(correctS);
  const newSHex = "0x" + padLeft(newS.toString(16), 64);

  const result = await wallet.call({
    to: P256VERIFY_CONTRACT_ADDRESS,
    data: compileSignature({ s: newSHex }),
  });

  expect(result).to.eq(ONE);
});
```

<details>
<summary>Signature Malleability</summary>

A phenomenon in elliptic curve digital signature algorithms (ECDSA) and similar cryptographic methods, where multiple valid signatures can be generated using the same message and private key.

#### Why Does Signature Malleability Occur?

1. **Mathematical Properties of Signatures:**
   - In elliptic curve signatures, the `s` value results from a mathematical operation performed during signature generation. In ECDSA, the `s` value is calculated as:
     - `s = k^-1 × (z + r × d) mod n`
     - Where `k` is a random value, `z` is the message hash, `r` is the x-coordinate of the elliptic curve point, `d` is the private key, and `n` is the order of the subgroup.
   - Signature malleability often occurs when the `s` value is replaced with its complement within the order `n` (i.e., `s' = n - s`), producing a different but still valid signature.
2. **ECDSA Design Characteristics:**
   - ECDSA inherently checks that the `s` value is less than `n`. However, the ability to substitute `s` with `n - s` introduces malleability, a characteristic inherent to ECDSA.

#### **Can Signature Malleability Create Security Vulnerabilities?**

Signature malleability can cause several security issues:

1. **Transaction Replay Attack:**
   - In blockchain systems, transactions with a particular signature are designed to be processed only once. However, if multiple valid signatures can be generated for the same transaction, they could be used in replay attacks.
   - For example, a malicious user could generate multiple valid signatures from the same message (or transaction) and submit the same transaction multiple times to the network. This could lead to transaction duplication or compromise network integrity.
2. **Confusion in Smart Contracts:**
   - If signatures are malleable, it could cause confusion in smart contracts that verify the validity of signatures. For instance, a smart contract that tracks or manages a state based on unique signatures could interpret malleable signatures as distinct, leading to potential errors.

#### **Mitigation Strategies**

Several strategies can be used to address or mitigate signature malleability:

1. **Canonicalization:**
   - This involves enforcing that the `s` value is always kept below half the subgroup order `n` during signature creation. This removes the possibility of generating a malleable signature.
2. **Strengthening Transaction Hashing:**
   - Including the signature in the transaction hash in blockchain systems can prevent replay attacks. This method ensures that the same transaction cannot be submitted with different signatures.

</details>

#### **Test Case 7: secp256k1 Signature Verification**

When a signature is generated using a key pair from the secp256k1 curve and verified using the precompiled contract, the verification fails, and a zero-length byte array is returned.

```typescript
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
```

### **Running P256Verify Tests**

Run the test command to execute the tests on the ZKsync test node.

```bash
$ yarn test --grep P256Verify
```

```
  P256Verify
    ✔ Should verify the valid signature
    ✔ Should reject the invalid signature
    ✔ Should reject when the calldata is too short
    ✔ Should reject when calldata is longer than 160 bytes
    ✔ Should reject large s/r, which are not in the group
    ✔ Signature malleability is permitted
    ✔ secp256k1 signature should be rejected

  7 passing (322ms)

Done in 3.25s.
```

### **Summary**

- **Support for secp256r1 in ZKsync:** The v24 upgrade in ZKsync introduced a precompiled contract (P256Verify) supporting the secp256r1 curve. This contract is written in Yul and is designed to verify signatures.
- **P256Verify Contract Operation:** The P256Verify contract performs signature verification via a fallback function and returns 1 if the signature is valid. The input data must consist of the digest, `r`, `s`, `x`, and `y` values, with a total length of 160 bytes.
- **Test Scenarios:** The tests cover various cases, including valid signature verification, invalid signature rejection, signature malleability checks, and secp256k1 signature rejection. Each test focuses on verifying the accuracy and security of the P256Verify contract.

---

## Conclusion

The introduction of precompiled contracts supporting the secp256r1 curve in Ethereum's rollup ecosystem, as proposed in EIP-7212, offers several benefits. By leveraging the security features of modern devices and enhancing signature verification efficiency, this upgrade can significantly improve the user experience and security of Ethereum-compatible networks.

The implementation of EIP-7212 in ZKsync demonstrates how the P256Verify precompiled contract can be used to verify signatures on the secp256r1 curve. Through a series of tests, we verified the functionality of the contract and explored various scenarios to ensure the security and reliability of the signature verification process.

## References

[What is RIP-7212? Precompile for secp256r1 Curve Support](https://www.alchemy.com/blog/what-is-rip-7212)
[GitHub - matter-labs/era-contracts: Smart Contract Submodule For zkSync Era](https://github.com/matter-labs/era-contracts)
