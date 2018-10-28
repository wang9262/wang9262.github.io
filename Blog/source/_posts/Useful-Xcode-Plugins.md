title: Xcode 常用插件
date: 2016-09-17 20:29:00
tags: [Xcode,插件,Xcode8]
category: Tips
---

工欲善其事，必先利其器。随着 Xcode 的一步步变得强(yong)大(zhong)，许多功能已经被集成到 Xcode 中，但是日常开发还是会遇到很多小问题，影响效率，于是 Xcode plugins 便派上用场了。下面介绍一下自己在开发中常用的插件，排名不分先后，仅按字母排序。

<!-- more -->

> 关于 Xcode8 不能使用插件的问题，可以在我上一篇文章[让你的 Xcode8 继续使用插件][1]找到解决方案。

### [Alcatraz][2]
![](http://img.cdn.punmy.cn/14740910538405.jpg)

这个就不用多说了吧，所有插件包管理器，快捷键 `cmd + shift + 9`。

### [ATProperty][3]
![](http://img.cdn.punmy.cn/14740919509236.gif)
平时在属性声明时，总要写一堆的诸如 `@property (strong, nonatomic) UIWindow *window;`之类的，前面那一长串在属性一多时，写起来挺累的。这个插件正是为了解决这个痛点而存在，快捷键如下：

| 快捷键 | 结果 |
| :-- | :-- |
| @t | @property (nonatomic, strong) |
| @w | @property (nonatomic, weak) |
| @y | @property (nonatomic, copy) |
| @a | @property (nonatomic, assign) |

`readonly` 只需在 `@` 后插入 `r` 即可，比如 `@rt`，就是 `@property (nonatomic, strong, readonly)`

### [Auto-Importer][4]
![](http://img.cdn.punmy.cn/14740927781208.gif)

在写代码过程中，比如处在 line500 的时候要引入一个新的类，这个时候不得不滑到顶部，去写一次 `#import"xxxx.h"`，然后又滑回来继续写代码，严重影响效率。此时你需要这个插件来解决这个苦恼，随便一个地方，使用快捷键 `cmd + ctrl + h` 来呼出弹窗，在搜索框中输入想要导入的头文件即可，无需在滑到文件顶部，参考上图。

### [CATweakerSense][5]
![](http://img.cdn.punmy.cn/14740930409569.png)
用的不是很多，主要是在做动画比较有用，时间缓冲函数，将时间曲线可视化。

### [ColorSenseRainbow][6]
![](http://img.cdn.punmy.cn/14740932923044.png)
一目了然，颜色可视化。

### [DBSmartPanels][7]
![](http://img.cdn.punmy.cn/14740934576865.jpg)
智能化的区域隐藏插件，在输入时自动隐藏底部 `debug`、右侧 `inspector` 区域，具体可以自定义。
### [DXXcodeConsoleUnicodePlugin][8]
有时候在调试时，服务端返回的中文字符在 `debug console` 中总是显示成 `unicode`，这个插件可以将其自动转成中文字符。具体可到其 GitHub 主页查看用法。

### [FastStub][9]
![](http://img.cdn.punmy.cn/14740940467700.gif)

检测头文件、父类、协议等中的方法，然后自动在 `.m` 文件插入。快捷键 `cmd + ctrl + k`

### [FuzzyAutocomplete][10]
![](http://img.cdn.punmy.cn/14740942597943.gif)
快速补全。
### [GitDiff][11]
![](http://img.cdn.punmy.cn/14740943628859.jpg)
检测文件中的 git 状态。

### [RRConstraintsPlugin][12]
对系统 Auto Layout 的一些补充。

### [SCXcodeSwitchExpander][13]
![](http://img.cdn.punmy.cn/14741022908523.gif)

`switch` 时根据枚举类型，自动补全所有枚举

### [SCXcodeTabSwitcher][14]

![](http://img.cdn.punmy.cn/14741091449161.gif)

此插件用于存在多个 `tab` 时在 `tab` 间快速切换，类似 Chrome。快捷键 `Cmd + 1...9` 切换。

### [VVDocumenter-Xcode][15]
这个不用多说了吧。快速注释，现已集成到 Xcode8。

### [XAlign][16]
![](http://img.cdn.punmy.cn/14741140642718.gif)
对齐插件，可自定义对齐方式。

### [XQuit][17]
![](http://img.cdn.punmy.cn/14741141444896.png)
完全退出(cmd + q) Xcode 之前，弹出一个确认框，防止误操作。

### [XToDo][18]
![](http://img.cdn.punmy.cn/14741143739724.png)
![](http://img.cdn.punmy.cn/14741143787410.png)
用于工程中的一些标注，及快速查找这些标注的插件。

### [XVim][19]
Vim 控必备。

以上便是个人常用的 Xcode 插件，欢迎推荐。

[1]:http://vongloo.me/2016/09/10/Make-Your-Xcode8-Great-Again/
[2]:https://github.com/alcatraz/Alcatraz/
[3]:https://github.com/Draveness/ATProperty
[4]:https://github.com/citrusbyte/Auto-Importer-for-Xcode
[5]:https://github.com/keefo/CATweaker
[6]:https://github.com/NorthernRealities/ColorSenseRainbow
[7]:https://github.com/chaingarden/DBSmartPanels/
[8]:https://github.com/dhcdht/DXXcodeConsoleUnicodePlugin
[9]:https://github.com/music4kid/FastStub-Xcode
[10]:https://github.com/FuzzyAutocomplete/FuzzyAutocompletePlugin
[11]:https://github.com/johnno1962/GitDiff
[12]:https://github.com/RolandasRazma/RRConstraintsPlugin
[13]:https://github.com/stefanceriu/SCXcodeSwitchExpander
[14]:https://github.com/stefanceriu/SCXcodeTabSwitcher
[15]:https://github.com/onevcat/VVDocumenter-Xcode
[16]:https://github.com/qfish/XAlign
[17]:https://github.com/StefanLage/XQuit
[18]:https://github.com/trawor/XToDo
[19]:https://github.com/XVimProject/XVim




