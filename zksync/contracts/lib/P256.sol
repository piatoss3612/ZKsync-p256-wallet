// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

library P256 {
    address public constant P256VERIFY_ADDRESS = 0x0000000000000000000000000000000000000100;

    uint256 internal constant N = 0xFFFFFFFF00000000FFFFFFFFFFFFFFFFBCE6FAADA7179E84F3B9CAC2FC632551;
    uint256 private constant HALF_N = 0x7fffffff800000007fffffffffffffffde737d56d38bcf4279dce5617e3192a8;

    uint256 internal constant P = 0xFFFFFFFF00000001000000000000000000000000FFFFFFFFFFFFFFFFFFFFFFFF;
    uint256 internal constant A = 0xFFFFFFFF00000001000000000000000000000000FFFFFFFFFFFFFFFFFFFFFFFC;
    uint256 internal constant B = 0x5AC635D8AA3A93E7B3EBBD55769886BC651D06B0CC53B0F63BCE3C3E27D2604B;

    function verify(bytes32 digest, bytes32 r, bytes32 s, bytes32 x, bytes32 y) internal view returns (bool isValid) {
        if (!isProperSignature(r, s) || !isValidPublicKey(x, y)) {
            return false;
        }

        bytes memory callData = new bytes(160);

        assembly {
            mstore(add(callData, 0x20), digest)
            mstore(add(callData, 0x40), r)
            mstore(add(callData, 0x60), s)
            mstore(add(callData, 0x80), x)
            mstore(add(callData, 0xA0), y)
        }

        (bool success, bytes memory returnData) = P256VERIFY_ADDRESS.staticcall(callData);
        // It never reverts, though still check for success to be sure
        // If verification succeeded, the return data is 32 bytes long and contains 1
        if (success && returnData.length == 0x20) {
            isValid = abi.decode(returnData, (bool));
        }
        // If the call failed or the result is not 1, isValid is false by default
    }

    function isProperSignature(bytes32 r, bytes32 s) internal pure returns (bool) {
        return uint256(r) > 0 && uint256(r) < N && uint256(s) > 0 && uint256(s) <= HALF_N;
    }

    function isValidPublicKey(bytes32 x, bytes32 y) internal pure returns (bool result) {
        assembly ("memory-safe") {
            let p := P
            let lhs := mulmod(y, y, p) // y^2
            let rhs := addmod(mulmod(addmod(mulmod(x, x, p), A, p), x, p), B, p) // ((x^2 + a) * x) + b = x^3 + ax + b
            result := and(and(lt(x, p), lt(y, p)), eq(lhs, rhs)) // Should conform with the Weierstrass equation
        }
    }
}
