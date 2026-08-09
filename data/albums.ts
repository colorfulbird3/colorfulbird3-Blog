// 🛡️ 本文件由 XingHuiSama 控制台自动生成，请勿手动修改
export interface Photo { url: string; caption?: string; }
export interface Album { id: string; title: string; description: string; cover: string; date: string; photos: Photo[]; }

export const albums: Album[] = [
  {
    "title": "在治安局上班的日常",
    "description": "这封面真好看",
    "cover": "/uploads/c182141385e644159009bea34e478589.webp",
    "id": "album_1786105524636",
    "photos": [
      {
        "caption": "她真好看",
        "url": "/uploads/951bc6d04b9f46d8bf026e04269efaef.webp"
      },
      {
        "caption": "她真好看",
        "url": "/uploads/094d6f00562747b8a8508669a4005a79.webp"
      },
      {
        "url": "/uploads/b38937bf8f3b4ef994669a142562296d.webp",
        "caption": "她真好看\n"
      }
    ],
    "date": "2026-08-07"
  },
  {
    "title": "在GTI服役的那些年",
    "id": "album_1786105160268",
    "photos": [
      {
        "url": "/uploads/a8b22a0db224444fb639bf0aa51d7485.webp",
        "caption": "最猛的一集"
      },
      {
        "url": "/uploads/4bc15804ff2b48cbb4770c947248ee70.webp",
        "caption": "第一次出心"
      },
      {
        "url": "/uploads/fa8317c20c194d28bc98e8033d6bdcb2.webp"
      },
      {
        "url": "/uploads/a13584d7fea54f6f9178a128d76198a3.webp"
      }
    ],
    "date": "2026-08-07",
    "cover": "/uploads/4a45f24a4532486e92f06514113dbdd5.webp"
  }
];
