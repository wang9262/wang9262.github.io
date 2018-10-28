title: 高效利用你的Xcode[译]
date: 2014-07-23 23:37:48
comments: true
tags: [Xcode,翻译]
category: 翻译
---

好莱坞电影里经常看到黑客们手指在键盘上飞速跳跃,同时终端上的代码也随着飞舞。如果你也想像电影里那样,那么你来对地方了。这篇教程将会教你在Xcode编程中更像程序员,你可以称之为魔法、疯狂的技术、好运当头或者黑客。毫无疑问,在学习完本教程之后,不管你怎么认为,都会感觉很酷,同时能更高效地运用Xcode,甚至可以通过这些新发现使你的代码免于毁灭。

<!--more-->

[原文地址](http://www.raywenderlich.com/72021/supercharging-xcode-efficiency)
### 开始
要看起来很酷,所以有一些必不可少的因素.下面列出来的是其中一部分

- 快速执行任务
- 精准
- 简洁美观的代码

要表现地更酷,你可以试着不用鼠标或者触摸板来完成教程中的每一个任务.学习之旅将从学习一些实用的Xcode功能开始,然后通过修复一些在CardTilt中的一些bug来训练。最后你将整理一下你的代码,使整个界面看起来更整洁。在学习该教程时,要记住:它不是教你做一个app,而是教你比以前更有效地利用Xcode来开发app。这篇教程建立在你对Xcode有一个基本的了解的基础上,然后着重于提高你的工作效率。每个人都有自己的编程习惯,本教程并非强制你形成某种风格。自始至终,本教程中你会看到某些命令的替代品,随着本教程的学习,请集中精力在提炼和形成你自己的编程风格,不要让微小的错误影响你。

如果你对于Xcode不是很熟悉,建议先学习下面两篇教程。([教程1](http://www.raywenderlich.com/38557/learn-to-code-ios-apps-1-welcome-to-programming)和[教程2](http://www.raywenderlich.com/1797/ios-tutorial-how-to-create-a-simple-iphone-app-part-1))

下载 [CardTilt-starter](http://cdn2.raywenderlich.com/wp-content/uploads/2014/05/CardTilt-starter.zip),然后就可以愉快地写代码了。

### 日常Xcode任务
有一些在Xcode中你经常使用的技巧,这一部分让你更近距离的接触这些技巧,然后讲解一些潇洒应对它们的一些妙招。在这个过程中,你会在这些妙招的基础上发现使用它们的新方法。这些技巧将成为你编程工具腰带上的忍者之星。在Xcode中打开之前下载好的工程CardTilt,先不要急着去看代码,先将你Xcode的窗口和下图来一一对应。

![](http://ww1.sinaimg.cn/large/ba81ca29gw1evcbnfyp6vj20jg0cydi3.jpg)

是不是发现你的窗口和图中并不对应,先别着急。在下面介绍的快捷键部分,你将会学到如何轻松地显示以及隐藏这些对应的窗口。

下面是组成窗口的每一个独立区域的快速浏览:

- The Toolbar(工具栏): 你选择视图,运行app,在不同布局界面切换的地方
- The Navigation Area(导航区): 导航你整个工程,警告,报错等的地方
- The Editing Area(编辑区): 所有奇迹诞生的地方,包括它上方的Jump bar
- The Utility Area(工具区): 包含检测器和一些库
- The Debugging Area(调试区): 包括调试窗口和变量检测器

上面列出的所有视图区域都是Xcode的必要组成部分,它们也是在你开发过程中可能需要用到的,开发过程中通常不需要将他们一次性同时显示出来,下面将介绍一些快捷键,将会教你快速显示/隐藏这些视图区域。

### 快捷键
在这一部分,你将首先学到怎么掌握这些快捷键,得益于一些模式,最有效的快捷键非常容易记。

第一个需要知道的是Xcode的各区域与修饰键的关系,下面是一个快速浏览

- Command (⌘):用来导航,控制导航区域
- Alt (⎇): 控制右边的一些东西,比如Assistant Editor,utility editor
- Control: 编辑区域上的Jump bar的一些交互

第二个需要知道的时数字键和标签栏的关系,将数字键和上面提到的修饰键组合可以在标签页之间来回切换。通常数字键对应标签页的索引位置(从1开始),0通常用来显示/隐藏区域。它还能再直观一点吗?

下面是最常用的组合键:

- Command 1~ 8: 跳转到导航区的不同位置
- Command 0 :显示/隐藏导航区
- Command Alt 1~ 6:在不同检测器之间跳转
- Command Alt 0: 显示/关闭工具区.
- Control Command Alt 1~4: 在不同库之间跳转
- Control 1~ 6: 在Jump bar的不同标签页的跳转。

![](http://ww2.sinaimg.cn/large/ba81ca29gw1evcbo88ow9j20jg0cywfq.jpg)

最后也是最简单的就是回车键,当它和Command组合使用时,可以是你在Xcode中不同编辑器来回切换.

- Command + Enter: 显示标准单窗口编辑器
- Command Alt Enter:你可以猜下它的作用,它的功能是打开Assistant editor
- Command Alt Shift Enter: 打开版本控制编辑器

同样重要的是显示/隐藏调试区的快捷键是 Command + Shift + Y,要记住这个你可以通过这句话来记忆“Y is my code not working?”(译者注:Y谐音Why)。如果你忘记了一些快捷键,你可以在Xcode的菜单栏Navigate一项中找到大部分快捷键。在即将完成这一部分的学习之时,你会惊奇的发现你仅仅只是用了键盘就让Xcode发生这各种变换。

![](http://ww4.sinaimg.cn/large/ba81ca29gw1evcbox6qvog20jg0cdtjr.gif)

### Xcode的行为

使用快捷键来管理Xcode的界面却是挺棒,有没有想过更棒的事情?比如让Xcode自动转换到你想看到的界面。接下来我们将学到更酷的东西。

幸运的是,Xcode提供的Behaviors(行为)可以让你轻易地实现上面的事情。它们是一组定义好的有指定事件触发的动作,比如build一个工程。这里的动作的范围从改变界面到运行一个自定义脚本文件。来看一个例子,快速修改下载好的工程的CTAppDelegate.m文件,使其运行时会生成调试窗口输出,用下面的方法替代didFinishLaunchingWithOptions方法

```Objective-C
- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
    [[UIApplication sharedApplication] setStatusBarHidden:YES];
    // Override point for customization after application launch.
    NSLog(@"Show me some output!");
    return YES;
}
```
运行程序,然后仔细观察调试区,你会发现调试区随着app运行而出现,如下所示

![](http://ww3.sinaimg.cn/large/ba81ca29gw1evcbphsi0bg20ko0cge81.gif)

来看看是什么定义了上面的事件,在Xcode->Behaviors->Edit Behaviors打开Behavior偏好设置,在左侧你将看到所有事件集合,在右边是该事件可以触发的一些列动作。点击Running栏下的Generates output,然后发现它被设置成用来显示调试区。

![](http://ww4.sinaimg.cn/large/ba81ca29gw1evccgo1totj20ix0dw41j.jpg)

#### 一些推荐的行为

根据你的开发环境,我推荐的两种不同的Generates output事件触发动作集。如果你有多个屏幕,试着使用第一种,如果是单显示器,试着调到第二种方法。

##### 方法一

如果你在两个或者多个屏幕上开发,把调试区放到第二屏幕是不是更加方便,你可以向下面这样设置

![](http://ww3.sinaimg.cn/large/ba81ca29gw1evccho04c6j20ix0dw779.jpg)

现在,运行程序,然后你会看到一个分离的窗口出现,将它放到你的第二屏幕上,是不是效率高了不少?
##### 方法二
如果是单屏,通过隐藏工具板以及设置输出窗口占据整个调试区使输出窗口的有效区域最大化,设置如下

![](http://ww2.sinaimg.cn/large/ba81ca29gw1evcbqrikydj20ix0dw779.jpg)

然后运行程序,然后观察Xcode,看它是不是按照你的命令在执行。

![](http://ww1.sinaimg.cn/large/ba81ca29gw1evcbregci2g20ko0cgb29.gif)

当程序暂停的时候,你可能也想改变Xcode的行为,到Running栏下的Pauses事件,然后改变其设置,向下面这样:

![](http://ww2.sinaimg.cn/large/ba81ca29gw1evcbrx8dbgj20i20dwacl.jpg)

现在无论何时你设置了断点,你将会得到一个新的名为fix的展示变量和输出窗口的标签页,然后自动导航到第一个issue。

你将要创建的最后一个行为是我个人最喜欢的一个,它是一个自定义行为—设置一个快捷键。当被触发的时候,它使Xcode转变到我指定的为下一次开发而优化的布局,名为Dev Mode。我们可以通过点击Behavior偏好设置的左下角的+,然后将其取名为Dev Mode,双击Dev Mode右边的Command (⌘)符号然后输入Command .来定义一个快捷键

![](http://ww2.sinaimg.cn/large/ba81ca29gw1evcbsaehung206n01pt8s.gif)

接下来为该事件设置相应动作:

![](http://ww3.sinaimg.cn/large/ba81ca29gw1evcbsoiwkdj20i20dwaci.jpg)

现在,只要你按下command .就会触发上面设置的动作,即出现一个相同的整洁的开发界面。

下面将介绍Xcode tab name,和行为配合起来使用堪称完美。

Xcode Tab Names(Xcode标签名):可以通过双击标签页的标题来修改标签页的名称,对于它本身来说是一个无用的功能,但是当它和行为结合起来使用时就变得非常强大了。
在上面的第二个例子中,当改变Pauses行为时,命名了一个叫fix的标签页,这就意味着当行为被触发时,Xcode将会使用fix标签页(如果存在),如果不存在,它会新建一个名为fix的标签页。
另一个例子就是多屏Starts行为,如果一个名为Debug的标签页在之前运行时被打开,它将会复用这个标签页而不是重新创建一个。
用这种方式,你可以创建非常有趣的行为。

到现在为止,我们可以花点时间来回顾一下刚才的行为,不要着急,本教程会等着你。
### 小测验

在接下来的部分,你将在测验中用到上面所学到的技巧,然后在CardTilt项目中学到一些新的技巧。

运行CardTilt项目中，你看到如下画面

![](http://ww3.sinaimg.cn/large/ba81ca29gw1evcbt784ipj20c20jkjtx.jpg)

它不是你期待看到的画面？是时候消灭这些bug了！

#### 锁定bug

app似乎在加载数据时出现了问题，你的任务就是消灭它们。打开CTMainViewController.m文件然后进入开发模式Dev Mode，快捷键为之前设置的command。注意viewDidload方法中的前几行

```Objective-C
self.dataSource = [[CTTableViewDataSource alloc] init];
self.view.dataSource = self.dataSource;
self.view.delegate = self;
```

看起来CTTableViewDataSource实现了UITableViewDataSource协议，为tableview提供了数据。是时候展现你Xcode的技术了，按住command键，同时点击CTTableViewDataSource在编辑器中来打开CTTableViewDataSource.h。CTTableViewDataSource.m应该已经在你的Assistant Editor，如果不是这样的话，打开顶部的Jump Bar，像下图一一样切换到Assistant Editor的counterparts模式。

![](http://ww2.sinaimg.cn/large/ba81ca29gw1evcbtr4c4aj20cd0cn76b.jpg)

翻看代码，你会发现数组members装载数据，loadData方法从bundle中加载数据至数组members。在assistant editor右边任意位置鼠标右击，选择Open in Primary Editor，就会在Primary Editor中打开CTTableViewDataSource.m文件，下面动画是该步骤的展示：

![](http://ww2.sinaimg.cn/large/ba81ca29gw1evcbtr4c4aj20cd0cn76b.jpg)

为了看起来更酷炫，你可以在不用鼠标的情况下完成上面的所有事情，步骤如下：

- 1.同时按住Command + Shift + O，在输入框中输入CTMainViewController.m，然后回车来打开该文件。
- 2.Command + . 进入Enter Dev模式 。
- 3.将鼠标放在 CTTableViewDataSource 上，然后按住Command + Control + J，跳转至CTTableViewDataSource定义处。
- 4.按住 Command + J, -> 然后按下回车，来转换 assistant editor 的焦点
- 5.按住 ctrl +4 来下拉 Jump Bar，然后使用方向键和回车键来选择 counterparts
- 6.按住 Command + Alt，在 primary editor 中打开 CTTableViewDataSource.m 文件
- 7.上面的结果步骤看起来不呢么高效，但是它让你看起来很酷。

#### 修复bug

在self.members = json[@"Team"];打上断点来确定数据是否都被装载到数组members当中，然后运行程序。

如果对于基本的设置断点和调试不太熟悉，可以先看看[这篇教程](http://www.raywenderlich.com/video-tutorials)。

就像你之前在Xcode行为看到的一样，Generates output将首先被触发，紧接着Pause行为被触发。因为你之前在Pause有过自定义设置，所以Xcode会新建一个名为fix的标签页，它专为调试而设。

将目光切换到变量检测器variable inspector，你会发现数组members是nil，在loadData方法数组members被填充，代码如下

```Objective-C
NSDictionary *json = [NSJSONSerialization JSONObjectWithData:data options:kNilOptions error:&error];
self.members = json[@"Team"];

```

在变量检测器中查看json，看其是否被正确加载，你会发现数据中的第一个值是@"RWTeam"而不是@"Team"，当加载数组members时，这个值是错的，找到了一个bug。

让我们按下面步骤来修复这个bug：

- 使用command + .来进入开发模式
- 按住Command + Option + J跳至filter bar然后输入teammember
- 然后按住Alt同时点击TeamMembers.json在assistant editor来打开它
- 最后，使用"Team"来替换"RWTeam"

下图是上面四步的一个动画

![](http://ww2.sinaimg.cn/large/ba81ca29gw1evcbuh3yqrg20jg0bcu0y.gif)

现在移除断点，然后运行程序，它看起来应该像这个样子。

![](http://ww4.sinaimg.cn/large/ba81ca29gw1evcbv2p9w1j20c20jkq5c.jpg)

是不是看起来比之前要好一点了，但是还是有一些bug，比如Ray和Brian的标题描述栏不见了。接下来我们通过修复这些bug来学到更多酷炫的技巧。

### 加速

你应该已经知道`UITableViewCells在tableView:cellForRowAtIndexPath:`方法中被加载，所以用Open Quickly来导航到该方法，然后按照下面步骤：

- 按下Command + Shift + O来呼出Open Quickly
- 输入cellForRow
- 按下回车来打开它

按住command然后点击setupWithDictionary来跳转至其定义处，然后你会发现一些用来加载描述的代码

```Objective-C
NSString *aboutText = dictionary[@"about"]; // Should this be aboot?
 self.aboutLabel.text = [aboutText stringByReplacingOccurrencesOfString:@"\\n" withString:@"\n"];
```

它使用dictionary[@"about"]中的数据来加载label。

接下来呼出Open Quickly，然后打开TeamMembers.json，使用alt + command在Assistant Editor中打开。检查about的值，然后你会发现有人将about拼写成了aboot，我们可以使用全局的Find and Replace来修复这个bug。当然你可以在文件中直接做这件事，但是使用find navigate看起来更酷。打开find navigate，然后通过顶部的jump bar切换到替换(replace)模式，输入aboot,然后回车。

![](http://ww4.sinaimg.cn/large/ba81ca29gw1evcbvqwkkyj20c20jkq5c.jpg)

在TeamMembers.json文件之外还有一个地方使用到了aboot，别担心，选中CTCardCell.m的搜索结果，然后按下Delete，将鼠标移至replace filed，然后输入about，点击Replace All，一切完成。整个过程看起来是这个样子的：

![](http://ww1.sinaimg.cn/large/ba81ca29gw1evcbxo000lg20jg0bc1l2.gif)

进阶技巧:使用 Command + Shift + Option + F 来打开 Find navigator 的替换模式，如果你嫌麻烦，也可以使用 Command + Shift + F 来打开 Find navigator 的查找模式，如果你还嫌麻烦，使用 command + 3 来打开 Find navigator，然后开启查找或者替换模式，选择一种最适合自己的方式就好。

运行程序，看起来是这样的

![](http://ww4.sinaimg.cn/large/ba81ca29gw1evcbymqx48j20ah0hs76r.jpg)

### 让设计师高兴

今天的调试任务到此就结束了，给自己一点掌声，然后开始运行程序。在你将它展示给别人之前，需要先确定app的界面是完美的。尤其当这个人是非常认真的设计师的时候，这一部分教你一些关于interface builder的技巧，让你变得更酷。

打开Mainstoryboard.storyboard，通常你想在打开interface builder的同时打开standard editor和工具区(utilities area)，所以我们可以自定义一个新的叫做IB Mode的行为，当你在看下面的自定义发放之前，试着自己创建一个然后自定义，不必要完全一致。

![](http://ww4.sinaimg.cn/large/ba81ca29gw1evcbz07ee7j20gj0cewgq.jpg)

我将这个模式的快捷键设置为Command Option .，现在你将看到一个舒服的Interface Builder界面，看看CTCardCell。首先你想让mainView处于ContentView的正中央。有两种技巧可以完成这个需求：

- 按住Control + Shift，然后在mainView的任意位置鼠标左击，你将看到一个弹出视图让你选择在光标下的所有视图，如下图所示：

![](http://ww2.sinaimg.cn/large/ba81ca29gw1evcbzzrf1dj205i0980t5.jpg)

这个方法让你轻松的就能选中mainView，尽管cardbg遮住了它。选中mainView之后，按住Alt然后在ContentView的边缘移动鼠标，来看它们之间的间隔。下面是这个过程的一个动画：

![](http://ww4.sinaimg.cn/large/ba81ca29gw1evcc0nbf2vg20jg0avtcl.gif)

原来对其并不是那么优雅，看起来也不是很酷。为了解决这个，我们可以调整视图的大小。点击Editor->Canvas->Live Autoresizing来使子视图在父视图尺寸改变的时候强制调整大小。按住Alt同时拖拽mainView的一角，直到每边的距离为15.

拖拽是像素点级别的技巧，你可以尝试不同的调整的处理方法，就像下面动画一样。在很多情况下，更倾向于使用Size Inspector来调整复杂的布局，而非用鼠标来拖拽。

![](/images/blogimg/Xcode/SC4-IB21.gif)

试着使用相同的技巧来对齐titleLabel、locationLabel、aboutLabel,让他们竖直方向上的间隔为0。按住Alt来查看鼠标移动时，三个label之间的间隔。有发现三个label的左边缘并没有对齐吗？设计师肯定想让nameLabel和webLabel靠左对齐。使用Vertical Guide可以昂我们轻松完成这个任务。选中cardbg，然后点击菜单栏的Editor->Add Vertical Guide，这个步骤的快捷键是Command |，horizontal guide的快捷键是Command -，这两个快捷键是最可视化的。当视图上有了vertical guide之后，将其从cardbg的左边缘拖10个点。然后所有视图将会紧贴vertical guide，对的非常整齐，继续为其他的label进行对其操作。

Xcode并不那么完美，有时候可能在你创建guideline的时候出现一些问题，可以打开其他文件然后再切回到storyboard页面，然后storyboard会被重新加载，这个时候问题一般会自动解决。
让你更酷的建议：所有的视图能紧贴在guideline上才是最好的，guideline没有必要在同一个层级。

下图是上面对齐过程的一个回放：

![](http://ww4.sinaimg.cn/large/ba81ca29gw1evcc0nbf2vg20jg0avtcl.gif)

我敢打赌你现在迫不及待的想把你做的展示给你的设计师看！

### 提升和超越

上面的步骤让你得到了一个实用的app，同时让你的设计师也感到很满意，那么接下来我们要做的就是让代码变得更为简洁。

快速打开(Command + Shift + O)CTCardCell.m，记得进入Dev Mode(Command .)，你应该不会忘了这些快捷键吧。

看下CTCardCell.m顶部凌乱的属性列表

```Objective-c
@property (weak, nonatomic) IBOutlet UILabel *locationLabel;
@property (strong, nonatomic) NSString *website;
@property (weak, nonatomic) IBOutlet UIButton *fbButton;
@property (weak, nonatomic) IBOutlet UIImageView *fbImage;
@property (strong, nonatomic) NSString *twitter;
@property (weak, nonatomic) IBOutlet UIButton *twButton;
@property (weak, nonatomic) IBOutlet UILabel *webLabel;
@property (weak, nonatomic) IBOutlet UIImageView *profilePhoto;
@property (strong, nonatomic) NSString *facebook;
@property (weak, nonatomic) IBOutlet UIImageView *twImage;
@property (weak, nonatomic) IBOutlet UILabel *aboutLabel;
@property (weak, nonatomic) IBOutlet UIButton *webButton;
@property (weak, nonatomic) IBOutlet UILabel *nameLabel;
@property (weak, nonatomic) IBOutlet UILabel *titleLabel;
```

在这部分，你将创建一个自定义服务以执行脚本命令来实现属性的快速整齐地排列。

如果对于这些脚本命令还不熟悉，它们是相当好理解的。排序(sort)是按照字母顺序来的，uniq是会删除所有重复的行数。uniq在这里可能派不上用场，但是用它来管理#import，那是极好的。

Mac OS X允许你创建整个操作系统全局通用的服务，你将用它来创建一个用在Xcode中的脚本服务，按如下步骤来设置

使用Spotlight来搜索Automator，并打开它
然后点击File->New，并选择服务(service)一项
在Actions筛选栏，输入shell，然后双击运行shell脚本Run Shell Script
在新添加的服务的菜单栏上,检查Output replaces selected text
将脚本内容切换至sort | uniq
同时按下command s，将服务保存为 Sort & Uniq
最终的窗口看起来是这个样子：

![](http://ww2.sinaimg.cn/large/ba81ca29gw1evcc32vbs0j20o70icjv5.jpg)

切回到Xcode，然后选中CTCardCell.m中的那片混乱的属性区域，右击，选择Services -> Sort & Uniq，然后观察执行之后代码是多么的整洁。你可以看下面的一个示意图：

![](http://ww2.sinaimg.cn/large/ba81ca29gw1evccbende3g20jg0avgrn.gif)

### 代码片段

进行到这里，意味着那些基本的可以让你看起来酷酷的调试任务已经告一段落了，接下来我希望你觉得更酷。你可定想学更多技巧，幸运的是，这是最后分享的一个技巧。

你之前可能已经使用过Xcode的代码片段(Code Snippets)功能了，一些常见的是for in片段和dispatch_after片段。在这一部分，你将学会如何创建自定义的代码片段，当你重用这些代码片段时，看起来非常棒。你将创建的是获取单例的代码片段。

如果你不熟悉单例模式，可以看看这个教程。

下面可能是你使用单例模式的常用代码模板

```Objective-C
+ (instancetype)sharedObject {
  static id _sharedInstance = nil;
  static dispatch_once_t oncePredicate;
  dispatch_once(&oncePredicate, ^{
    _sharedInstance = [[self alloc] init];
  });
  return _sharedInstance;
}
```

非常酷的是这份片段也包含了dispatch_oncep片段。

在工程CardTilt创建一个名为继承自NSObject名为SingletonObject的新类，你不需要为它做任何事，除了作为拖拽代码片段的一个地方。

按下面步骤：

- 在@implementation 的下一行粘贴上面的代码到SingletonObject.m
- 用快捷键Command Option Control 2来打开代码片段库，在代码片段库中你会看到默认的包含在Xcode中的代码片段库。
- 选中整个+sharedObject方法，将其拖拽到代码片段库中。
看起来是这样的：

![](http://ww4.sinaimg.cn/large/ba81ca29gw1evcc9d8yleg20q60fm7b5.gif)

新创建的代码片段将会在代码片段库的最底部，你可以将其拖拽到任何你想拖拽的文件当中去，让我们来尝试一下。

双击刚刚新建的代码片段，然后点击edit.弹出的视图非常使用，实际上它们都很重要，所以做个简短的解释。

- Title and Summary：代码片段库中该代码片段的名字和简述
- Platform and Language:代码片段匹配的平台和编程语言
- Completion Shortcut:在Xcode中输入的快捷键
- Completion Scopes:代码片段作用的范围，这对于保持代码片段库整洁来说十极好的。
向下面一样填充里面的属性：

![](http://ww1.sinaimg.cn/large/ba81ca29gw1evcc9ud0gbj20bn07z75y.jpg)

#### 令牌
当你加入令牌时，代码片段将会变得非常强大，因为它允许你在片段中标记代码，而不需要硬编码。通过使用Tab键使得他们非常容易修改，就像自动补全一样。

在片段中仅仅只要输入<#TokenName#>就可以添加一个令牌，创建一个令牌使用shared<#ObjectName#>替代sharedObject，看起来像这样：

![](http://ww2.sinaimg.cn/large/ba81ca29gw1evccacwhcvj20bm080t9s.jpg)

点击Done来保存该片段，然后来用用它。

在SingletonObject.m文件中输入singleton accessor，然后当它出现的时候使用自动补全

![](http://ww4.sinaimg.cn/large/ba81ca29gw1evccaulztkg20b108ydh0.gif)

对于经常使用的代码来说，创建一个代码片段是非常实用的。

### 何去何从

总结一下在这个教程中你所学到的东西：

- 使用快捷键来改变Xcode的布局
- 使用自定义的行为来改变Xcode的布局
- 使用assistant editor
- 在Xcode中快速打开某文件
- 在Find navigator删除搜索到的结果
- 在Interface Builder使用快捷键和guideline来对齐视图
- 创建一个在Xcode中使用的服务
- 创建并使用自定义的代码片段
- 最重要的是你知道怎么去成为一名Xcode大师

上面列出来的内容都很简单对吧？在你的朋友面前展示这些炫酷的技巧，你的朋友一定会惊呆也会理解你的兴奋。还有很多方法可以提高你的Xcode的效率，比如：

[使用Doxygen风格的注释](http://www.raywenderlich.com/66395/documenting-in-xcode-with-headerdoc-tutorial)

[使用Xcode插件](http://nshipster.com/xcode-plugins/)

下一步就是去寻找新的酷炫的技巧，我希望你能享受整个教程的学习过程，如果你有任何问题、评论、或者想分享你所知道的炫酷技巧，请在下面评论中指出。

