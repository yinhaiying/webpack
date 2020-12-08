## webpack学习内容集合

## 前沿
由于对webpack的学习比较零散，每次学习一点知识都重新建立了一个github仓库，这样的话导致知识比较零散，后续复习也比较麻烦。因此，建立这个仓库用于将所有的学习资源进行整合。使用lerna作为多项目包管理工具。

## 目录结构
```javascript
├─ast_babel -------------------- 学习ast和babel的转化
│  └─project1
├─loader  ---------------------- webpack中loader相关的内容
│  ├─dist
│  ├─loaders   ----------------- 对css的处理放在bundle_css.ts
│  └─project_css --------------- 对css的处理放在抽离出来的函数中——这就是loader
├─my-simple-webpack ------------- 我的自定义简易webpack
└─simple-webpack    ------------- 网上的简易自定义webpack
    └─project1
```