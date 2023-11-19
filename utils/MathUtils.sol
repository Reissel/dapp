// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

library MathUtils {
    function subtractOrZero(int num1, int num2) internal pure returns (int result) {
        if(num2 > num1) {
            result = 0;
        } else {
            result = num1 - num2;
        }
    }
}