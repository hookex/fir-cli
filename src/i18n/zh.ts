export default {
  welcome: {
    slogan: '你的命令行助手',
    version: {
      current: '当前版本: v{version}',
      latest: '最新版本: v{version}',
      update: '运行 "npm install -g fir-cli" 更新',
      latest_version: '你正在使用最新版本'
    }
  },
  commands: {
    chrome: {
      desc: '打开 Chrome 浏览器',
      success: '✓ Chrome 已成功打开'
    },
    push: {
      desc: '推送更改（如果没有提供消息，将使用 AI 生成）',
      build_flag: '在提交消息中添加 [build] 标签'
    },
    git: {
      desc: 'Git 操作',
      unstaged: '发现未暂存的更改：',
      stage_prompt: '是否暂存这些更改？',
      staged: '更改已暂存',
      stage_manual: '请在提交前手动暂存更改',
      ai_prompt: '是否使用 AI 生成提交消息？',
      generating: '正在生成提交消息...',
      gen_failed: '生成提交消息失败',
      commit_prompt: '请输入提交消息：',
      commit_empty: '提交消息不能为空',
      committed: '更改提交成功',
      upstream_prompt: '未找到分支 \'{branch}\' 的上游分支。是否设置？',
      upstream_set: '上游分支设置成功',
      push_cancel: '推送已取消',
      pushed: '更改推送成功'
    },
    ip: {
      desc: '显示 IP 地址',
      title: 'IP 地址：',
      local: '局域网',
      public: '公网',
      notAvailable: '不可用'
    },
    time: {
      desc: '显示北京和 UTC 时间',
      title: '当前时间：',
      beijing: '北京',
      utc: 'UTC',
      press_ctrl_c: '  按 Ctrl+C 停止',
      watch: '每秒自动更新时间'
    },
    code: {
      desc: '在编辑器中打开当前目录'
    },
    commit: {
      desc: '提交更改（如果没有提供消息，将使用 AI 生成）'
    },
    ping: {
      desc: '测试域名连接',
      pinging: '正在测试...',
      testing: '测试 {domain}... {time}ms',
      summary: '总结：'
    },
    install: {
      desc: '运行或安装并运行全局 npm 包'
    },
    translate: {
      desc: '在中英文之间翻译文本',
      translating: '正在翻译...',
      completed: '翻译完成',
      result: '结果：'
    },
    config: {
      desc: '配置设置和查看历史',
      menu: {
        show: '显示当前配置',
        language: '更改界面语言',
        ai: '配置 AI 设置',
        exit: '退出'
      },
      language: '语言',
      current_config: '当前配置：',
      save_success: '配置保存成功',
      select_action: '选择操作：',
      select_language: '选择界面语言：',
      exiting: '正在退出...',
      back: '返回主菜单',
      ai: {
        show: '显示当前 AI 配置',
        language: '切换 AI 回复语言（中文/英文）',
        history: '显示聊天历史',
        clear: '清除聊天历史'
      }
    },
    ai: {
      desc: '与 AI 助手对话',
      thinking: '思考中...',
      ai: 'AI：'
    },
    clean: {
      desc: '清理 git 更改，恢复修改的文件并删除未跟踪的文件'
    },
    debug: {
      desc: '分析最后一次命令执行',
      analyzing: '正在分析最后一次命令...',
      analysis: '命令分析',
      commandInfo: '命令信息',
      baseCommand: '基础命令',
      arguments: '参数',
      processInfo: '进程信息',
      envInfo: '环境信息',
      workingDir: '工作目录',
      nodeVersion: 'Node 版本',
      platform: '平台'
    },
    statistics: {
      desc: '显示各类型文件的代码统计',
      title: '代码统计',
      current: '当前项目统计',
      day: '最近24小时变更',
      week: '最近一周变更',
      month: '最近一月变更',
      year: '最近一年变更',
      header: '文件类型',
      files: '文件数',
      lines: '行数',
      added: '新增',
      deleted: '删除',
      percentage: '占比',
      total: '总计',
      dayOption: '显示最近24小时的变更',
      weekOption: '显示最近一周的变更',
      monthOption: '显示最近一月的变更',
      yearOption: '显示最近一年的变更'
    }
  },
  common: {
    error: '错误：',
    success: '✓ {message}',
    warning: '⚠ {message}'
  }
};
