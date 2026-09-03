/** 游戏规则 */

export const jobSeekerRules = {
  steps: [
    {
      title: 'Step 1 制卡',
      lines: [
        '发送您的简历及清晰正面照至TOHC，',
        '用于制作个人求职卡。'
      ]
    },
    {
      title: 'Step 2 购卡',
      lines: [
        '每张求职卡限量发行500编号，',
        '您和其他收藏玩家均可购买，售完即止。'
      ]
    },
    {
      title: 'Step 3 评级',
      lines: [
        '在线提交您个人最佳offer证明，获得卡片评级。',
        '（制卡前发放的offer不计入评级）'
      ]
    },
    {
      title: 'Step 4 回购',
      lines: [
        'TOHC 根据评级结果，',
        '按对应价格回购您持有的求职卡。',
        '您可寄回卡片获得收益，或继续收藏。'
      ]
    }
  ],
  notesTitle: '请特别注意：',
  notes: [
    '卡面会隐去或以脱敏形式呈现具体住址、',
    '电话号码、身份证号；',
    'offer证明可能需要接受真实性及时效性验证；',
    '若发现offer造假，',
    'TOHC将撤销评级并取消该卡的回购资格；',
    'offer的发放日期不可早于',
    'TOHC接收您简历的日期。'
  ]
}

export const collectorRules = {
  steps: [
    {
      title: 'Step 1 购卡',
      lines: ['挑选您看好的潜力求职者，尽情下单求职卡。']
    },
    {
      title: 'Step 2 评级',
      lines: ['经过评级的求职卡具备回购资格。']
    },
    {
      title: 'Step 3 回购',
      lines: [
        '您可以选择将持有的求职卡',
        '寄回TOHC出售获益，',
        '或继续收藏。'
      ]
    }
  ]
}
