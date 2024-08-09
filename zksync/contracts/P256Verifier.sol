// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {SystemContractsCaller} from
    "@matterlabs/zksync-contracts/l2/system-contracts/libraries/SystemContractsCaller.sol";

library P256Verifier {
    address public constant P256VERIFY_ADDRESS = 0x0000000000000000000000000000000000000100;

    function verify(bytes32 digest, bytes32 r, bytes32 s, bytes32 x, bytes32 y) internal view returns (bool isValid) {
        (bool success, bytes memory returnData) = P256VERIFY_ADDRESS.staticcall(abi.encodePacked(digest, r, s, x, y));
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
