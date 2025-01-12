export default {
  welcome: {
    slogan: 'Your command line companion',
    version: {
      current: 'Current version: v{version}',
      latest: 'Latest version: v{version}',
      update: 'Run "npm install -g fir-cli" to update',
      latest_version: 'You are using the latest version'
    }
  },
  commands: {
    chrome: {
      desc: 'Open Chrome browser',
      success: '✓ Chrome opened successfully'
    },
    push: {
      desc: 'Push changes with optional commit message (uses AI if message is empty)',
      build_flag: 'Add [build] tag to commit message'
    },
    git: {
      desc: 'Git operations',
      unstaged: 'Unstaged changes found:',
      stage_prompt: 'Would you like to stage these changes?',
      staged: 'Changes staged',
      stage_manual: 'Please stage your changes manually before committing',
      ai_prompt: 'Would you like to use AI to generate commit message?',
      generating: 'Generating commit message...',
      gen_failed: 'Failed to generate commit message',
      commit_prompt: 'Enter commit message:',
      commit_empty: 'Commit message cannot be empty',
      committed: 'Changes committed successfully',
      upstream_prompt: 'No upstream branch found for \'{branch}\'. Would you like to set it up?',
      upstream_set: 'Upstream branch set up successfully',
      push_cancel: 'Push cancelled',
      pushed: 'Changes pushed successfully'
    },
    ip: {
      desc: 'Show IP addresses',
      title: 'IP Addresses:',
      local: 'Local',
      public: 'Public',
      notAvailable: 'Not available'
    },
    time: {
      desc: 'Show current time in Beijing and UTC',
      title: 'Current Time:',
      beijing: 'Beijing',
      utc: 'UTC',
      press_ctrl_c: '  Press Ctrl+C to stop',
      watch: 'Auto update time every second'
    },
    code: {
      desc: 'Open current directory in editor'
    },
    commit: {
      desc: 'Commit changes with a message (uses AI if message is empty)'
    },
    ping: {
      desc: 'Ping domain(s)',
      pinging: 'Pinging...',
      testing: 'Testing {domain}... {time}ms',
      summary: 'Summary:'
    },
    install: {
      desc: 'Run or install and run a global npm package'
    },
    translate: {
      desc: 'Translate text between English and Chinese',
      translating: 'Translating...',
      completed: 'Translation completed',
      result: 'Result:'
    },
    config: {
      desc: 'Configure settings and view history',
      menu: {
        show: 'Show current configuration',
        language: 'Change interface language',
        ai: 'Configure AI settings',
        exit: 'Exit'
      },
      language: 'Language',
      current_config: 'Current Configuration:',
      save_success: 'Configuration saved successfully',
      select_action: 'Select an action:',
      select_language: 'Select interface language:',
      exiting: 'Exiting...',
      back: 'Back to main menu',
      ai: {
        show: 'Show current AI configuration',
        language: 'Toggle AI response language (English/Chinese)',
        history: 'Show chat history',
        clear: 'Clear chat history'
      }
    },
    ai: {
      desc: 'Chat with AI assistant',
      thinking: 'Thinking...',
      ai: 'AI:'
    },
    clean: {
      desc: 'Clean git changes, restore modified files and remove untracked files'
    },
    debug: {
      desc: 'Analyze last command execution',
      analyzing: 'Analyzing last command...',
      analysis: 'Command Analysis',
      commandInfo: 'Command Information',
      baseCommand: 'Base Command',
      arguments: 'Arguments',
      processInfo: 'Process Information',
      envInfo: 'Environment Information',
      workingDir: 'Working Directory',
      nodeVersion: 'Node Version',
      platform: 'Platform'
    },
    statistics: {
      desc: 'Show code statistics by file extension',
      title: 'Code Statistics',
      current: 'Current Project Statistics',
      day: 'Last 24 Hours Changes',
      week: 'Last Week Changes',
      month: 'Last Month Changes',
      year: 'Last Year Changes',
      header: 'Extension',
      files: 'Files',
      lines: 'Lines',
      added: 'Added',
      deleted: 'Deleted',
      percentage: 'Percentage',
      total: 'Total',
      dayOption: 'Show changes in the last 24 hours',
      weekOption: 'Show changes in the last week',
      monthOption: 'Show changes in the last month',
      yearOption: 'Show changes in the last year'
    }
  },
  common: {
    error: 'Error:',
    success: '✓ {message}',
    warning: '⚠ {message}'
  }
};
