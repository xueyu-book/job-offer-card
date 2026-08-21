/** 游戏规则 */

export const jobSeekerRules = {
  role: '求职者：',
  steps: [
    {
      title: 'Step 1 制卡',
      lines: [
        '将您的简历及清晰正面照发送至TOHC小红书后台或官方邮箱 tohcsupport@163.com，TOHC 将为您制作个人求职卡。'
      ]
    },
    {
      title: 'Step 2 购卡',
      lines: ['每张求职卡限量发行1000个编号，您和其他收藏玩家均可购买，售完即止。']
    },
    {
      title: 'Step 3 评级',
      lines: [
        '11月1日至11月8日在线提交您个人最佳offer证明，获得评级打分。',
        '评级结果一旦锁定，不可更改。',
        '（您收到offer的日期不可早于您求职卡的下单日期）'
      ]
    },
    {
      title: 'Step 4 回购',
      lines: [
        'TOHC 将根据评级结果，按对应价格回购您的求职卡。您可寄回卡片获得收益。',
        '（寄卡地址：广东省广州市越秀区东风中路 363号 1104之一）'
      ]
    }
  ],
  notesTitle: '请特别注意：',
  notes: [
    '卡面展示的内容会隐去具体住址、电话号码、身份证号',
    '求职者上传的offer证明可能需要接受真实性验证及时效性验证',
    '若发现offer造假，TOHC将撤销评级并取消该卡的回购资格'
  ]
}

export const collectorRules = {
  role: '收藏家：',
  steps: [
    {
      title: 'Step 1 选卡',
      lines: ['挑选您看好的求职者，下单其求职卡。']
    },
    {
      title: 'Step 2 评级',
      lines: ['经过offer评分的求职卡具备回购资格。']
    },
    {
      title: 'Step 3 回购',
      lines: [
        '您可以选择将持有的求职卡寄回TOHC出售获益，或继续持有收藏。',
        '（寄卡地址：广东省广州市越秀区东风中路 363号 1104之一）'
      ]
    }
  ]
}
