---
title: WWDC 2018：使用日志框架测量性能
date: 2019-02-22 22:17:46
tags: [WWDC]
category:  原创
---

> 本文是 WWDC 2018 Session 405 的观后感，原视频和 pdf 可以在[这里](https://developer.apple.com/videos/play/wwdc2018/405/)看到。
> 首发于[小专栏](https://xiaozhuanlan.com/topic/3789465012)。

众所周知，应用交互的流畅度决定了用户对这款用户的喜爱度，所以对于每个 iOS 工程师而言，应用的流畅程度是非常重要的。而这里所说的流畅度在工程师层面来理解就是应用的性能是否处于一个比较优的状态。那我们在发现页面卡顿时，如何去检测卡顿是哪一段代码引起的呢？目前业界的卡顿检测已经非常多了，比如 Instrument 的 Time Profile，各种基于 `runloop` 的卡顿率检测开源库。但是今天主要来说一说 iOS12 苹果为我们带来的一个新的检测方案，也就是基于 `OSLog` 的一套新 API。

<!-- more -->

好了，题外话讲完，我们正式进入正题。该 Seesion 主要有下面几部分组成：

- 集成 signposts
    - 异步并行操作
    - 添加原数据
    - 控制 signposts 的启用和禁用
- 使用 Instruments 分析

首先先简单回顾一下 `OSLog`，苹果在2016年推出这个现代化的日志记录框架，用来获取系统调试信息，这个框架主要是为效率而生。可以看一个简单实例

```swift
let logHandle = OSLog(subsystem: "com.example.widget", category: "Setup")
os_log(.info, log: logHandle, "Hello, %{public}s!", world)
```

> PS: 更多内容可以参看 [WWDC 2016 Session 721 Unified Logging and Activity Tracing](https://developer.apple.com/videos/play/wwdc2016/721/)

这里要介绍的 `Signpost` 对 `OSLog` 进行了一些扩展，新增了一些用于衡量性能的 API。首先我们来看看如何在代码中集成 `Signpost`。

### 集成 Signpost

#### 使用 signpost 计算耗时

想象一下我们有这样一个应用，包含了一组图片的 feed 流，滑动过程中，我们会去加载 feed 流的封面，页面如下图所示。
![-w200](http://img.cdn.punmy.cn/15358675135125.jpg)
我们想要获取每张封面的加载耗时，如果使用 `Signpost` 相关 API 我们需要如何做呢？
使用 `Signpost` 我们可以标记每个任务的开始和结束，然后将他们关联起来，调用的相关 API 也比较简单，我们只需要做一个简单的打点，通过两个关联的打点，我们就可以记录这个任务的具体耗时，如下图所示。
![](http://img.cdn.punmy.cn/15358678750813.jpg)

伪代码如下

```swift
// 引入 os 框架
import os.signpost

// 使用自定义标识和分类创建一个 log，subsystem 建议使用 bundle id，category 主要用于对相关联的操作进行分类
let refreshLog = OSLog(subsystem: "com.example.your-app", category: "RefreshOperations")
for element in panel.elements {
    // 任务开始前打点
    os_signpost(.begin, log: refreshLog, name: "Fetch Asset")
    fetchAsset(for: element)
    // 任务结束打点，注意  log 和 name 要和开始前的匹配，这样才会自动关联
    os_signpost(.end, log: refreshLog, name: "Fetch Asset")
}
```

如果想要统计所有任务的耗时，也非常简单，只需要在 for 循环前后埋点即可，不过需要注意的一点是 name 的值，如上所述因为想要计算的所有任务的耗时，所以新起了一个值，来进行关联。代码如下

```swift
let refreshLog = OSLog(subsystem: "com.example.your-app", category: "RefreshOperations")
os_signpost(.begin, log: refreshLog, name: "Refresh Panel")
for element in panel.elements {
    os_signpost(.begin, log: refreshLog, name: "Fetch Asset")
    fetchAsset(for: element)
    os_signpost(.end, log: refreshLog, name: "Fetch Asset")
}
os_signpost(.end, log: refreshLog, name: "Refresh Panel")
```

整个时间轴看起来如下图所示
![](http://img.cdn.punmy.cn/15358689521743.jpg)

#### 异步任务耗时的计算

如果我们的任务是一步步循序渐进的，上面的方式是没问题的，但是实际应用场景中，大部分任务是异步同时进行的。因此上面的 name 唯一标识在异步并行的场景下，不再能满足我们的需求，因为各任务的起始时间是一样的，但是结束时间肯定不一样，如果都用相同的 name 来做唯一标识，时间轴肯定会存在重叠的情况，因此无法区分各个任务的耗时时间。
![](http://img.cdn.punmy.cn/15358714494675.jpg)

因此为了解决上述问题，我们可以使用另一个 `Signpost` 的 API，叫做 `signpost ID`。通过 `signpost ID`，可以区分同种类型操作中的不同任务。所以即使两个任务时间轴有重叠，但是由于 `signpost ID` 的存在，系统就可以区分出这是两个不同的时间间隔，所以只要 `.begin` 和 `.end` 打点时传入的 ID 一致，系统就会把二者自动关联起来，计算耗时。代码如下：

```swift
let refreshLog = OSLog(subsystem: "com.example.your-app", category: "RefreshOperations")
let spidForRefresh = OSSignpostID(log: refreshLog)
os_signpost(.begin, log: refreshLog, name: "Refresh Panel", signpostID: spidForRefresh)
for element in panel.elements {
    let spid = OSSignpostID(log: refreshLog, object: element)
    os_signpost(.begin, log: refreshLog, name: "Fetch Asset", signpostID: spid)
    fetchAssetAsync(for: element) {
        os_signpost(.end, log: refreshLog, name: "Fetch Asset", signpostID: spid)
    }
}
notifyWhenDone {
    os_signpost(.end, log: refreshLog, name: "Refresh Panel", signpostID: spidForRefresh)
}
```

signpost ID 可以通过 OSSignpostID 构建函数传入一个 log handler，以及任意一个对象（可选）。后面的 `object` 参数非常有用，因为只要传入的 object 是一样的，那么生成的 ID 也是一样的（当然前提是 log handler 也要一致）。

从上面示例我们可以得知，只要 `.begin` 和 `.end` 的其它参数是一致的，系统就会自动将其匹配，这样就可以在任何地方去进行“打点”。

所以整个 API 总结一下，大概是下面这样一个层级。
![](http://img.cdn.punmy.cn/15358748792069.jpg)


| 参数 | 示例 | 含义 |
| :-: | :-: | :-: |
| Log category | "RefreshOperations" | 相关操作 |
| Signpost name | "Fetch Asset" | 想要计算的某类操作 |
| Signpost ID | spid | 同一类操作下的某个任务 |

#### 添加自定义 Metadata

看完上面部分，你可能会有个疑问：是否可以在 signpost 中携带一些额外信息呢？答案是肯定的。`os_signpost` 函数为我们提供了一些可选参数，用于传递上下文。传入的参数得是 os_log 格式的字符串，可以传入不同类型的参数以及动态字符串，最终这些字符串都会显示在 Instrument 中。
![](http://img.cdn.punmy.cn/15358795943113.jpg)

#### 添加独立事件

除了上面提到的自定义元数据，我们可能还想在 `.begin` 和 `.end` 之间记录一些特定的“点”，因此苹果给了我们一种新的类型，OSSignpostType.event。我们可以使用它来记录一些过程中的特定点，比如上面提到的图片加载的某个特定进度，或者记录加载过程中的用户点击行为等等。

![](http://img.cdn.punmy.cn/15358802713581.jpg)

```swift
os_signpost(.event, log: log, name: "Fetch Asset", "Fetched first chunk, size %u", size)
os_signpost(.event, log: log, name: "Swipe", "For action 0x%x", actionCode)
```


#### Signpost 禁用及启用

默认情况下，`Signpost` 是启用的，但是某些情况下，我们并不想开启它，比如 `Release` 模式下包或者提交到 `Appstore` 的包。
苹果工程师一再强调 `Signpost` 本身非常轻量，同时在它被触发的时候也做了很多优化，同时在编译器层面也做了一些优化来确保它作用于运行时之前，把很多工作推迟到 Instrument 的处理时期，所以当它被触发时几乎不会消耗系统资源。
所以为了可以根据条件来启/禁用 Signpost，系统提供了一个默认的 `OSLog.disabled` 的 `log handler`，使用此 `log handler` 创建的 `Signpost`，都会被禁用，所以只需几行代码就可以搞定是否需要开启 `Signpost` 的需求，亦即只需要根据条件修改 `log handler` 初始化方式即可。

```swift
let refreshLog: OSLog
if ProcessInfo.processInfo.environment.keys.contains("SIGNPOSTS_FOR_REFRESH") {
    refreshLog = OSLog(subsystem: "com.example.your-app", category: "RefreshOperations")
} else {
    refreshLog = .disabled
}
```

当然，如果有一些 `Signpost` 代码如果比较耗时，我们也可以通过判断当前 `log handler` 是否被禁用来进行下一步操作。示例代码如下

```swift
// 如果获取 info 比较耗时，那可以先进行一次判断
if refreshLog.signpostsEnabled {
    let information = copyDescription() 
    os_signpost(..., information)
}
```

以上示例代码都是用的 `Swift`，但是在 C 代码中，它们也是可以用的。对应关系如下图，如果需要了解更多，可以进到对应的头文件，查看其使用方式和相关说明。
![](http://img.cdn.punmy.cn/15358883833924.jpg)

### 与 Instruments 配合使用

这一章节，苹果工程师以一个本地徒步旅行的应用（参照上面截图）作为示例，展示了如何使用 `Signpost` 进行埋点，然后通过 Instrument 获取埋点数据，进而来进行对埋点的耗时分析计算。

#### 查看 Signpost 数据

我们可以 Instruments(10) 来记录、查看和分析我们在上面说的所有的埋点。下面是 Demo 的一些相关背景：

> 通常情况下，我们为了性能优化，会把一些耗时任务放到异步线程，等任务完成后再回到主线程，这样就很难对其进行时间的测量分析。当用户滑动的时候，就会同时触发多个图片下载任务。如果用户滑动非常迅速，那么很多图片在 cell 被重用时可能还没有下载完成，所以我们就需要取消这些下载任务，如果我们没有取消的话，就会平白多出几个我们并不想要的下载任务。

cell 有一个 startImageDownload 方法用来下载图片，代码如下
![](http://img.cdn.punmy.cn/15358904937593.jpg)
每个下载任务开始时，会根据图片名称创建 `downloader`，然后根据 `downloader` 创建一个 `SignpostID` 用来作为这个下载任务的 `Signpost` 数据唯一标识，然后通过将图片名称传入到元数据中。

然后图片下载完成的回调如下
![](http://img.cdn.punmy.cn/15358908311971.jpg)
同样直接通过 `downloader` 创建一个 `SignpostID`，这样可以确保 `.begin` 和 `.end` 能够匹配。注意到这里传入的 metadata `"Finished with size %{xcode:size-in-bytes}llu"`，这里的 `xcode:size-in-bytes` 告诉 Xcode 和 Instrument 这个参数在分析和展示时要当做 `bytes` 来处理。它们被称为工程类型（engineering types），可以在[Instruments Developer Help](https://help.apple.com/instruments/developer/mac/current/)查看更多相关信息。
![](http://img.cdn.punmy.cn/15358914508594.jpg)

在 cell 被重用时，我们需要记录图片下载的 cancel 操作，代码如下
![](http://img.cdn.punmy.cn/15358915510212.jpg)
处理类似，不再赘述。

通过 Xcode->Product->Profile(或者快捷键 cmd+I) 来启动 Instrument。然后选取一个空白（Blank）配置，进行下面操作

> 右上角 + 按钮，然后搜索 `os_signpost`，然后选中将其拖入到左边栏，然后点击 Record 即可。
> ![](http://img.cdn.punmy.cn/15358918715861.jpg)

一顿滑动之后，停止录制（Record），然后查看顶部面板，我们可以看到各个图片加载的耗时，以及我们在埋点时传入的元数据。
![](http://img.cdn.punmy.cn/15358920774831.jpg)
同时后续时间的一些 signpost 数据如下
![](http://img.cdn.punmy.cn/15358923459450.jpg)
从这张图我们可以看到同时下载数不超过5个，这样证明我们的 `cancel` 方法生效了。为了证明这一点，放大得到下图
![](http://img.cdn.punmy.cn/15358923147799.jpg)
可以看到滑动过程中确实产生了很多 metadata 是 `cancel` 的 signpost 数据。

如果我们想要看图片下载耗时，我们能可以看底部数据栏
![](http://img.cdn.punmy.cn/15358926294639.jpg)
Instrument 会按照 `SignpostID` 进行汇总，然后给出各项数据，比如个数、最大值、最小值、标准差、平均值。同一个 `SignpostID` 又分为 `Finished` 和 `Cancel`。还记得上面提到 `size-in-bytes` 么？这里每一个 Finished 后面都跟了一个这张图片的字节数。如果想用 metadata 数据进行分析，我们可以切到下图所示的分类。

![](http://img.cdn.punmy.cn/15358929757440.jpg)
Instrument 根据 `log handler` 的 `subsystem`、`category`、`format string`、`arguments` 各个参数进行了一个分层。因为我们在格式化字符串中只有一个参数，所以这里只展示了 arg0。然后会根据 `size-in-bytes` 类型，算出总加载大小以及最大值、最小值、标准差、平均值，所以通过它，我们可以快速分析一些元数据传入的数据。

前面提到为了保证 OSLog 的轻量性，大部分工作被推迟到 Instrument 来处理，所以如果我们在录制的时候采用即时模式(默认)，数据直接交由 Instrument 处理，它就会实时展示和记录相关数据。当我们触发的 signpost 足够多时，那么整个流程会变慢，甚至你的 App 和电脑都将变得卡顿。所以为了避免这种情况，在每次录制前，最好先更改它的录制模式。操作方式就是长按录制按钮，然后选择录制选项（Recording Options），然后在弹出的面板进行类似下图的操作，将默认的即使模式（Immediate Mode）更改为你想要的模式，示例中选的是最后5秒。
![](http://img.cdn.punmy.cn/15358940972622.jpg)

#### 兴趣点

如果我们只想简单记录一些点击事件，但是又不想让这些点击事件淹没在上面的大量 `signpost` 数据中，也不想每次都创建空白配置，然后自行添加 `os_signpost` 配置，那么我们就可以使用兴趣点(`Points Of Interest`)的方式。具体如何操作的呢？其实和其它的 `signpost` 类似，不过创建 `log handler` 时，`category` 参数要传入 `.pointsOfInterest`，这是一种会被 Instrument 自动识别的特殊分类。
创建和使用代码示例如下图
![](http://img.cdn.punmy.cn/15358949360440.jpg)
![](http://img.cdn.punmy.cn/15358949032555.jpg)

运行 Instrument，然后选择 `Time Profile` 配置，该配置会自带兴趣点一栏的数据。
![](http://img.cdn.punmy.cn/15358951679891.jpg)

#### 自定义 Instrument

通过 Demo 演示了如何通过自定义 Instrument 来快速直接地进行记录和分析，展示面板基本类似上面的数据查看。至于如何创建自定义 Instrument，可以查看 [Session 410 Creating Custom Instruments](https://developer.apple.com/videos/play/wwdc2018/410/) 来了解更多。 

### 总结

通过使用 `signpost`，我们可以轻易地记录时间段，捕获感兴趣的元数据，然后通过 Instruments 来查看和分析 signpost 数据，查看时间花在哪些地方，更清楚的了解到程序的行为。
