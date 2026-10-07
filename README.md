# DSH 中文极简模式

一个可重复安装的 DeepSeek Harness Web 插件。安装后新增“中文极简模式”：

- 工具组成继承官方 Minimal preset，只保留持久 Shell。
- 完整系统提示词来自用户可编辑的 Markdown 文件。
- 初始提示词是：`你是一个中文助手`。
- 更新或重装插件不会覆盖已经存在的提示词文件。

## 安装

```bash
dsh plugin --profile web add github:GemChance/dsh-chinese-minimal-mode
```

安装后重启 DSH Web：

```bash
dsh web --no-open
```

在新会话的模式选择器中选择“中文极简模式”。

## 修改系统提示词

默认文件：

```text
~/.dsh/prompts/chinese-assistant.md
```

直接修改该文件。插件会在每次模型调用前检查文件，下一轮即可读取新内容，无需重新安装。

该 Markdown 被注册为 `complete: true` 且关闭 runtime context，因此它是该模式唯一的系统提示词内容。

## 更新

```bash
dsh plugin --profile web add github:GemChance/dsh-chinese-minimal-mode
```

## 卸载

```bash
dsh plugin --profile web remove dsh-chinese-minimal-mode
```

删除插件不会删除 `~/.dsh/prompts/chinese-assistant.md`。

## 兼容性

- Node.js 20+
- DeepSeek Harness `0.2.x` 预览版

DeepSeek Harness 仍处于开发者预览阶段，未来破坏性变更可能需要升级本插件。

## License

MIT
