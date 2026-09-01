/** 卡牌展示：自动读取 src/assets/images/card
 *  正面 {serial}.jpg，背面 {serial}_back.jpg
 *  同时有 rate、date，以及 prize 或 price 时，头部切换为后期样式 */

const cardImageModules = import.meta.glob('@/assets/images/card/*.jpg', {
  eager: true,
  import: 'default'
})

/** 可选：为特定序号补充价格/评级等元数据 */
const cardMeta = {
  // 1: { price: 66, rate: 4.8, date: '2026/08/23' },
}

function parseFrontSerial(path) {
  const name = path.split('/').pop() || ''
  if (/_back\.jpg$/i.test(name)) return null
  const match = name.match(/^(\d+)\.jpg$/i)
  return match ? Number(match[1]) : null
}

export const cardList = Object.keys(cardImageModules)
  .map(parseFrontSerial)
  .filter((serial) => serial != null)
  .sort((a, b) => a - b)
  .map((serial) => ({
    id: serial,
    serial,
    ...(cardMeta[serial] || {})
  }))
