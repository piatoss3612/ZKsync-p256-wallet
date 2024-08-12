// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

library P256Verifier {
    address public constant P256VERIFY_ADDRESS = 0x0000000000000000000000000000000000000100;

    function verify(bytes32 digest, bytes32 r, bytes32 s, bytes32 x, bytes32 y) internal view returns (bool isValid) {
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
        if (success && returnData.length > 0) {
            uint256 result;
            assembly {
                result := mload(add(returnData, 32))
            }

            isValid = result == 1;
        }
        // If the call failed or the result is not 1, isValid is false by default
    }
}
