/** 卡牌展示：序号、价格（正面 {serial}.jpg，背面 {serial}_back.jpg） */
// export const cardList = [
//   { id: 1, serial: 1, price: 66, glow: 'hsl(45, 95%, 55%)' },
//   { id: 2, serial: 2, price: 88, glow: 'hsl(0, 90%, 55%)' },
//   { id: 3, serial: 3, price: 66, glow: 'hsl(210, 80%, 65%)' },
//   { id: 4, serial: 4, price: 128, glow: 'hsl(140, 70%, 45%)' },
//   { id: 5, serial: 5, price: 66, glow: 'hsl(320, 75%, 65%)' },
//   { id: 6, serial: 6, price: 98, glow: 'hsl(40, 95%, 55%)' },
//   { id: 7, serial: 7, price: 66, glow: 'hsl(190, 85%, 55%)' },
//   { id: 8, serial: 2, price: 168, glow: 'hsl(0, 90%, 55%)' }
// ]

const GLOW_BY_SERIAL = {
  1: 'hsl(45, 95%, 55%)',
  2: 'hsl(0, 90%, 55%)',
  3: 'hsl(210, 80%, 65%)',
  4: 'hsl(140, 70%, 45%)',
  5: 'hsl(320, 75%, 65%)',
  6: 'hsl(40, 95%, 55%)',
  7: 'hsl(190, 85%, 55%)'
}

const PRICE_POOL = [66, 88, 98, 128, 148, 168, 188, 208]

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function pick(list) {
  return list[randomInt(0, list.length - 1)]
}

/** 卡牌展示：序号、价格（正面 {serial}.jpg，背面 {serial}_back.jpg） */
export const cardList = Array.from({ length: 60 }, (_, index) => {
  const serial = randomInt(1, 7)
  return {
    id: index + 1,
    serial,
    price: pick(PRICE_POOL),
    glow: GLOW_BY_SERIAL[serial]
  }
})
