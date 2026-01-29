const { env } = require("process");

function getLocale() {
  const envLang = env.LANG || env.LC_ALL || env.LANGUAGE;
  if (envLang) {
    if (envLang.toLowerCase().includes("zh")) {
      return "zh";
    }
    // If env var is set but not zh, we assume it's English (or at least not Chinese)
    // This allows overriding the system locale for tests or user preference.
    return "en";
  }
  
  try {
    const sysLocale = new Intl.DateTimeFormat().resolvedOptions().locale;
    if (sysLocale.toLowerCase().startsWith("zh")) {
      return "zh";
    }
  } catch (e) {
    // ignore
  }
  
  return "en";
}

const isZh = getLocale() === "zh";

const resources = {
  en: {
    usage: "Usage",
    options: "Options",
    help: "Show help",
    version: "Show version",
    update: "Update to specified version (keyboard select)",
    open: "Open npm package page in browser",
    versionLength: "Limit online version list length (default: 6)",
    example: "Example",
    binuDesc: "binu is a shorthand for bin-home <command> --update.",
    binuFunc: "Function: Show version info and enter update flow.",
    binuUsage: "Usage",
    helpMessage: "Help Information:",
    viewDetails: "View details",
    exit: "Exit",
    currentVersion: "Current version",
    onlineVersion: "Online version",
    loadingOnline: "Fetching online versions...",
    updateCanceled: "Update canceled",
    updating: "Updating...",
    updateCompleted: "Update completed",
    updateFailed: "Update failed",
    selectVersion: "Select version to update (Use arrow keys, Enter to confirm, Esc to cancel):",
    enterVersion: "Enter version to update (default: {0}):",
    commandNotFound: "Command '{0}' not found in system PATH",
    packageNotFound: "No npm package found for command '{0}'. It may not be installed via npm.",
    openError: "Failed to open URL in browser: {0}"
  },
  zh: {
    usage: "用法",
    options: "选项",
    help: "显示帮助信息",
    version: "显示版本信息",
    update: "更新到指定版本（交互式选择）",
    open: "在浏览器中打开 npm 包页面",
    versionLength: "限制线上版本列表显示的长度（默认：6）",
    example: "示例",
    binuDesc: "说明: binu 是 bin-home <command> --update 的缩写。",
    binuFunc: "功能: 显示版本信息并进入更新流程。",
    binuUsage: "用法",
    helpMessage: "帮助信息:",
    viewDetails: "查看详细说明",
    exit: "退出",
    currentVersion: "当前版本",
    onlineVersion: "线上版本",
    loadingOnline: "正在获取线上版本...",
    updateCanceled: "已取消更新",
    updating: "正在更新...",
    updateCompleted: "更新完成",
    updateFailed: "更新失败",
    selectVersion: "请选择要更新的版本（上下方向键选择，回车确认，Esc 取消）：",
    enterVersion: "请输入要更新的版本 (默认 {0}):",
    commandNotFound: "在系统 PATH 中未找到命令 '{0}'",
    packageNotFound: "未找到命令 '{0}' 对应的 npm 包。它可能不是通过 npm 安装的。",
    openError: "无法在浏览器中打开 URL: {0}"
  }
};

function t(key, ...args) {
  const lang = isZh ? "zh" : "en";
  let text = resources[lang][key] || resources["en"][key] || key;
  args.forEach((arg, index) => {
    text = text.replace(`{${index}}`, arg);
  });
  return text;
}

module.exports = { t, isZh };
