## lerna的使用


### 创建package
```javascript
lerna create + packageName
```
## 创建公共包
```javascript
# lerna-repo
yarn add xxx
```

## 运行scripts命令
```javascript
lerna run dev --scope ast_babel # 如果没有--scope参数则默认运行所有packages下面的dev命令
```
