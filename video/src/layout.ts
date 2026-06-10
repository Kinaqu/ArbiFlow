// Shared geometry so the cursor lands on the right spot and the allow-list
// cards line up identically between the allow-list and rebalance scenes.
export const FRAME_W = 1920;
export const FRAME_H = 1080;

export const CARD_W = 384;
export const CARD_GAP = 40;
export const CARDS_W = CARD_W * 3 + CARD_GAP * 2; // 1232
export const CARDS_X0 = (FRAME_W - CARDS_W) / 2; // 344

export const cardLeft = (i: number): number => CARDS_X0 + i * (CARD_W + CARD_GAP);
export const cardCenter = (i: number): number => cardLeft(i) + CARD_W / 2;
