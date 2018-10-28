title: 让你的 Xcode8 继续使用插件
date: 2016-09-10 20:08:39
tags: [Xcode,插件,Xcode8]
category : Tips
---

随着 iOS10 的正式版即将发布，Xcode8 GM 也在发布会后放出，本文不会涉及到 Xcode8 有哪些更新，而是记录了如何让 Xcode8 继续支持 Plugin。

<!-- more -->

### Update:

**2017.4.9**

Xcode 8.3 生成 XcodeGr8 后，XVim 即使用脚本更新也会失效，需要重新编译一次。下载 XVim 到本地后，需要删除删除如下几个文件：

> IDEPlaygroundEditor+XVim.h
> IDEPlaygroundEditor+Xvim.m 
> 同时屏蔽掉 XVim/XVimHookManager.m 里面对上面两个文件的引用和调用

详情参考这个 [issue: Build failure with Xcode 8.3][issue]

**2016.10.8**
如果你的 XcodeGr8 时不时就转菊花卡死，可以试下这种方式：打开`系统偏好设置->安全性与隐私->通讯录->将 Xcode 前面的勾去掉`，如下图所示，解决方案来自 `Xvim` 的这个 [issue][11]。

![](http://img.cdn.punmy.cn/14759295440293.jpg)

**2016.9.16**
看到 GitHub 上有一个 repo 可以一句命令即可解决本文提到的所有问题 [update_xcode_plugins][9]，没有亲测，如果觉得本文方法比较麻烦，可以一试。

我个人常用的 Xcode 插件可以参见这篇文章[Xcode 常用插件][10]。

---

相信各位已经有尝试过 Xcode-beta 了，但是会发现之前所有的插件都失效了。一开始我以为是和之前一样 Xcode 升级了，需要更新 Xcode info.plsit 中的 DVTPlugInCompatibilityUUID,于是运行了如下命令，具体修复原理和方案可以参考这篇文章 [Xcode升级后插件失效的原理与修复办法][1]。

```
find ~/Library/Application\ Support/Developer/Shared/Xcode/Plug-ins -name Info.plist -maxdepth 3 | xargs -I{} defaults write {} DVTPlugInCompatibilityUUIDs -array-add `defaults read /Applications/Xcode-beta.app/Contents/Info.plist DVTPlugInCompatibilityUUID`
```
结果还是无效，去 Github 上看，果然一堆人遇到了这个问题，可以看下这个 [issue][2]。由于 Xcode8 没了插件支持，我用的时候勉强还能习惯，一个用习惯了 Xvim 的同事表示不能忍，于是就去到 [XVim][3] 看有没有提这个 issue，果然也是有一堆人提到了这个问题，作者也给出了对应的解决方案，摘录最主要的一段如下：

>With Xcode 8 and above, you'll be asked if you want to remove code singature from Xcode. It is required to make the XCode load XVim. So if you are OK just type 'y' to proceed and remove code signature from your Xcode.

但是我并没有按照这种方式来操作，而是结合这个 [issue][4] 中的解决方案，总结起来步骤如下：

> 1. 编译 [MakeXcodeGr8Again][5] 并且导出其 product (关于 MakeXcodeGr8Again，下文会详细说到)。
> 2. 退出 Xcode8，同时运行刚刚导出的 MakeXcodeGr8Again，将 Xcode8 拖入其中，等待一段时间(3~10分钟)。
> 3. 等菊花转完后，应用程序文件夹下会生成一个 XcodeGr8 的应用，运行命令 `sudo xcode-select -s /Applications/XcodeGr8.app/Contents/Developer` 将 Xcode 开发路径指向刚生成的 XcodeGr8。
> 4. 既然 Xcode8 的签名已被移除，那么就可以继续使用上面的修复插件失效代码。但是上面的脚本要稍微改一下就是把 Xcode.app 换成 XcodeGr8.app 即可。代码如下：

```
find ~/Library/Application\ Support/Developer/Shared/Xcode/Plug-ins -name Info.plist -maxdepth 3 | xargs -I{} defaults write {} DVTPlugInCompatibilityUUIDs -array-add `defaults read /Applications/XcodeGr8.app/Contents/Info.plist DVTPlugInCompatibilityUUID`
```

下面我们来看下步骤1提到的 MakeXcodeGr8Again，其 [ReadMe][6] 也有对应的介绍。这里大概摘录一下:
>苹果为了避免类似 [Xcode Ghost 👻][7] 事件的再次发生，Xcode8 禁用了插件机制，而开放了另一种形式：[Source Editor extensions][8]，但是这种形式局限性太大。MakeXcodeGr8Again 只是去除了它的签名，这样使得 Xcode8 也可以继续使用插件了。由于签名被移除，所以它的安全性又重回 Xcode7 时代，也就是还有可能受到类似 Xcode Ghost 的攻击。所以不推荐用 XcodeGr8 来提交应用到 Appstore。Use at your own risk.


PS：可能遇到的问题

- 1.生成了 XcodeGr8 之后，打不开。  解决方法：重启。
- 2.如果之前对其它版本的 Xcode-beat 也有使用这种方式，再对 Xcode8 GM 也是用该方式可能 MakeXcodeGr8Again 这个 APP 会一直闪退。  解决方法：卸载之前生成的 XcodeGr8，再重试。卸载后记得将开发路径重新指回原来的路径，即 `sudo xcode-select -s /Applications/Xcode.app/Contents/Developer`。如果这种方式还不行，卸载所有版本的 Xcode，然后再安装 GM 版，重复上述步骤。

PPS：如果要卸载 XcodeGr8，记得将重新开发路径置回初始状态。

最后，重要的事情说三遍：
**不要使用 XcodeGr8 打包上传 Appstore，最好使用服务器打包，保证服务器 Xcode 是 Appstore 下载的！！！
不要使用 XcodeGr8 打包上传 Appstore，最好使用服务器打包，保证服务器 Xcode 是 Appstore 下载的！！！
不要使用 XcodeGr8 打包上传 Appstore，最好使用服务器打包，保证服务器 Xcode 是 Appstore 下载的！！！**

[1]:http://joeshang.github.io/2015/04/10/fix-xcode-upgrade-plugin-invalid/
[2]:https://github.com/alcatraz/Alcatraz/issues/475
[3]:https://github.com/XVimProject/XVim
[4]:https://github.com/XVimProject/XVim/issues/979#issuecomment-242976786
[5]:https://github.com/fpg1503/MakeXcodeGr8Again
[6]:https://github.com/fpg1503/MakeXcodeGr8Again/blob/master/README.md
[7]:https://en.wikipedia.org/wiki/XcodeGhost
[8]:https://developer.apple.com/videos/play/wwdc2016/414/
[9]:https://github.com/inket/update_xcode_plugins
[10]:http://vongloo.me/2016/09/17/Useful-Xcode-Plugins/
[11]:https://github.com/XVimProject/XVim/issues/966#issuecomment-247276024
[issue]:https://github.com/XVimProject/XVim/issues/1058#issuecomment-289703908






