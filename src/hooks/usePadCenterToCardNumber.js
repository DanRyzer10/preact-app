import { useState } from "preact/hooks";


export const usePadCenterToCardNumber = (cardNumber) => {
    const [centeredCardNumber, setCenteredCardNumber] = useState(cardNumber);
    const padCenterToCardNumber = (cardNumber) => {
        const cardNumberLength = cardNumber.length;
        if (cardNumberLength < 16) {
        const remainingLength = 16 - cardNumberLength;
        const padLength = Math.floor(remainingLength / 2);
        const [firstPart, secondPart] = [
            cardNumber.slice(0, Math.floor(cardNumberLength / 2)),
            cardNumber.slice(Math.floor(cardNumberLength / 2), cardNumberLength),
        ];

        const paddedCardNumber = `${firstPart}${"X".repeat(padLength)}${secondPart}`;
        setCenteredCardNumber(paddedCardNumber);
        }
    };
    return [centeredCardNumber, padCenterToCardNumber];
}