"use client";

import { siteConfig } from '../siteConfig';

const fieldLabels: Record<string, string> = {
  clientID: 'Client ID',
  repo: '评论仓库名',
  owner: '仓库所有者',
  admin: '管理员账号',
};

export function getMissingGitalkFields() {
  const config = siteConfig.gitalkConfig;
  const missing = ['clientID', 'repo', 'owner'].filter(
    (field) => !String(config[field as keyof typeof config] ?? '').trim()
  );

  if (!Array.isArray(config.admin) || !config.admin.some((name) => name.trim())) {
    missing.push('admin');
  }

  return missing;
}

export default function GitalkConfigNotice({ missing }: { missing: string[] }) {
  return (
    <div className="rounded-2xl border border-amber-400/40 bg-amber-50/80 p-5 text-sm text-amber-950 backdrop-blur dark:bg-amber-950/40 dark:text-amber-100">
      <p className="font-bold">GitHub 评论登录尚未配置完成</p>
      <p className="mt-2">
        缺少：{missing.map((field) => fieldLabels[field] ?? field).join('、')}。
        请在博客管理器的“评论系统配置”中填写 GitHub OAuth App 和评论仓库信息后重新部署。
      </p>
    </div>
  );
}
