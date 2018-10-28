---
title: 替换系统音量提示的实现和遇到的坑
date: 2018-06-03 17:47:58
tags: [原创]
category: Tips
---

相信平时大家在用 iPhone 看视频调节音量时，总会被系统的音量提示所打扰，因为它会遮住一部分内容。所以很多视频应用都使用自定义音量视图的方式来替代系统的音量提示。

<!--more-->

比如下面三张截图，分别来自 Instagram、哔哩哔哩、即刻

![](http://img.cdn.punmy.cn/15247541167324.jpg)

### 原理

这里主要记录一下在项目中如何替换系统音量提示视图的过程。通过 `Google` 和 `stackoverflow`，可以查到，如果要自定义音量提示，需要做到以下几步：

1. 激活 `AudioSession`
2. 创建一个 `MPVolumeView`，并将其添加到当前可见的视图层级当中，同时将其 frame 设置到不可见区域
3. 监听音量按钮触发事件，改变音量提示

### 实现

然后为了调用统一且音量视图层级永远在最上方（即不被 `Alert` 等挡住），首先想到使用一个 `UIWindow`，然后自定义视图和系统的视图加到这个视图层级上，初始化时 `frame` 为 `CGRectZero`，`hidden` 属性为 `NO`（注意这里必须为 `NO`，不然系统音量提示仍会出现，上面说到的第2点）；要显示时设置其 `frame` 设置成 `mainScreen` 的 `bounds`，然后展示即可。

> 由于自己创建的 `UIWindow` 的 `hidden` 属性默认是 `YES`，所以需要手动将其设成 `NO`。
> 音量按钮每触发一次，变化量都是 6.25%，连续按16次，即可调节至最大或最小

上述的第3步有两种方式可以做到，各有优劣，下面来做一个简单介绍。

#### KVO

通过 `KVO` 监听 `[AVAudioSession sharedInstance]` 的 `outputVolume` 属性，然后来显示自定义的 UI 控件。这种方式有一个不好的地方就是，在音量调节至最大/最小时，这个时候再调大/调小音量，由于 `outputVolume` 的值不变，所以不会触发 `KVO`，也就无法展示自定义音量视图。代码大概长下面这样

```objc
- (void)dealloc {
    [[AVAudioSession sharedInstance] removeObserver:self
                                         forKeyPath:NSStringFromSelector(@selector(outputVolume))];
}

- (void)addObserver {
    [[AVAudioSession sharedInstance] addObserver:self
                                      forKeyPath:NSStringFromSelector(@selector(outputVolume))
                                         options:NSKeyValueObservingOptionNew
                                         context:nil];
}

- (void)observeValueForKeyPath:(NSString *)keyPath
                      ofObject:(id)object
                        change:(NSDictionary<NSKeyValueChangeKey,id> *)change
                       context:(void *)context {
    if ([change isKindOfClass:[NSDictionary class]]) {
        NSNumber *volumeNum = change[@"new"];
        if (volumeNum) {
            [self volumeDidChange:[volumeNum floatValue]];
        }
    }
}

- (void)volumeDidChange:(CGFloat)volume {
    // 显示自定义音量提示
}
```

#### 通知

这种方式通过监听系统私有（未公开的）通知，名字是 `AVSystemController_SystemVolumeDidChangeNotification`，这个监听不会受到最大/最小音量时，调大/调小音量的影响，只要音量键按下，始终都会触发。但是这个通知由于是私有的，可能存在被拒风险，而且将来系统版本该通知名字发生改变，由于是硬编码而不像其它系统通知使用的是常量，会导致监听不到的问题。

代码大概长这样

```objc
static NSNotificationName const kSystemVolumeDidChangeNotification = @"AVSystemController_SystemVolumeDidChangeNotification";

- (void)dealloc {
    [[NSNotificationCenter defaultCenter] removeObserver:self];
}

- (void)addObserver {
    [[NSNotificationCenter defaultCenter] addObserver:self
                                             selector:@selector(volumeDidChange:)
                                                 name:kSystemVolumeDidChangeNotification
                                               object:nil];
}

- (void)volumeDidChange:(NSNotification *)notification {
    NSString *category = notification.userInfo[@"AVSystemController_AudioCategoryNotificationParameter"];
    NSString *changeReason = notification.userInfo[@"AVSystemController_AudioVolumeChangeReasonNotificationParameter"];
    if (![category isEqualToString:@"Audio/Video"] || ![changeReason isEqualToString:@"ExplicitVolumeChange"]) {
        return;
    }

    CGFloat volume = [[notification userInfo][@"AVSystemController_AudioVolumeNotificationParameter"] floatValue];
    // 显示自定义音量提示
}

```

以上两种方式各自优劣势都已经列出来了，上面说到的三个应用，`Instagram` 使用的是通知的方式，即刻和哔哩哔哩都是用 `KVO` 的方式。具体要选那种方式，就看具体需求了，如果在最大或最小时，调节音量可以接受不展示音量视图的话，个人推荐使用 `KVO` 的形式。

### 遇到的问题

上面阐明了原理和实现方式，接下来就是接入到项目中真正使用了，接入项目后发现问题还不少。

#### 坑0x0001

由于我们使用了 `window` 来显示自定义音量提示，所以 `window` 需要提前创建好，有一个需要注意的是 `UIWindow` 的 `hidden` 默认是 `YES`，由于上面说到系统的音量视图必须在可见视图层级内，所以创建的这个 `window` 必须要可见，然后尽量不影响交互，将其 `userInteractionEnabled` 置为 `NO`，且要让其不可见时层级最低，`windowLevel` 设置为 `UIWindowLevelNormal`。

```objc
self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
self.window.hidden = NO;
self.window.windowLevel = UIWindowLevelNormal - 1;
self.window.rootViewController = [[UIViewController alloc] init];
self.window.backgroundColor = [UIColor clearColor];
self.window.userInteractionEnabled = NO;
```

#### 坑0x0010

这样一切看起来很正常，但是有一个问题就是有一些地方通过 `[[UIApplication sharedApplication].windows firstObject]` 来进行一些操作，比如展示 `toast` 或者收起键盘的 `UIControl`，所以会导致其不可见或者无法响应交互。
所以上面代码改成

```objc
self.window = [[UIWindow alloc] initWithFrame:CGRectZero];
self.window.clipsToBounds = YES;
self.window.windowLevel = UIWindowLevelNormal;
```

嗯，运行起来，那些寻找 `firstObject` 的地方都正常了，但是...由于存在开屏广告，而且开屏广告用的也是 `window`，而且他会在自己要显示时，调用 `makeKeyAndVisible` 方法，消失的时候直接将其置为 `nil`，导致系统会自己寻找其它的 `window` 当做 `keyWindow`，这个时候不知道为什么会找到我们音量提示的 `window`？难道是因为 `[UIApplication sharedApplication].delegate.window` 层级是 `Normal`，音量提示 `window` 层级也是 `Normal`，然后会将后加入的  层级为 `Normal` 的 `window` 设置为 `key window`？暂时还不懂，有知道的大神麻烦指点一下。
这样看来，这种修改方式也不太行，会导致其它地方取 `keyWindow` 的时候，取错掉。

#### 坑0x0011

嗯，那索性直接用 `[UIApplication sharedApplication].delegate.window` 这个来显示音量提示，最多也就出现 `Alert` 或键盘的时候，音量提示会被遮罩挡住，概率也比较小还好。于是改成下面代码

```objc
self.window = [UIApplication sharedApplication].delegate.window;
```

但是这个时候会发现，iPhoneX 下音量提示会被状态栏挡住，wtf！！！那么好吧，在音量显示的时候隐藏一下状态栏，音量消失的时候回复一下之前记住的状态栏状态，但是如果存在两个页面状态栏显隐不一致的情况，就会出现问题。同时在某些 `present` 起来的页面，音量提示死活不显示，但是用 `Xcode` 自带视图层级调试工具看，音量提示视图的 `frame`、`alpha`、`hidden` 属性都是正常的，但就是没有显示出来。后面将提示视图 `layer` 的 `zPosition` 提高之后，就可以显示出来了，真的很神奇。

一步步下来，填完一个坑，又来一个，感觉是个无底洞，永远填不满。搞了一晚上，一筹莫展。

##### 完美填坑

最后灵光一闪，如果自定义一个 `Window`，继承自 `UIWindow`，然后复写 `becomeKeyWindow` 方法，在这个方法里让自身不成为 `keyWindow` 同时将 `[UIApplication sharedApplication].delegate.window` 设置为 `keyWindow`，大致代码长这样：

```objc
@interface VolumeWindow : UIWindow

@end

@implementation VolumeWindow

- (void)becomeKeyWindow {
    [self resignKeyWindow];
    [[UIApplication sharedApplication].delegate.window makeKeyWindow];
}

@end
```

#### 坑0x0100

拍摄页拍摄之前系统音量提示是可以被替换的，但是拍摄一段之后，莫名其妙音量按钮按下后自定义提示不见了，出现了系统的铃声提示。一脸懵逼，后面发现是由于设置了 `AVCaptureSession` 的 `usesApplicationAudioSession` 为 `NO`，会导致在拍摄之后会变成铃声，这个和是否替换系统音量提示无关。这个属性是由于项目中很久之前需要兼容 `iOS6`，然后一直遗留着这个属性设置没有删除。由于 `iOS7` 之后，`AVCaptureSession` 和应用使用的是同一个 `AudioSession`，支持同时播放和录制且不会受到影响和打断，所以不需要再去设置这个属性。

#### 坑0x0101

做了以上操作，在 iPhoneX 下，当拉起控制中心，并上下滑调整音量后，再回到应用，会发现自定义音量视图会出现在状态栏下面，猜测虽然在应用内自定义音量视图 `window` 层级高于状态栏 `window` 层级，但是由于状态栏是全局的，在重新进入到应用时会出现状态栏层级高于音量视图。所以就索性仅在应用为 `active` 的情况下才处理 `KVO`。

最后一个需要注意的点是在语音电话（或者其它使用系统音量的场景下）时，去自己应用内调节音量是无效，因为这个时候音量其实代表的是系统在占用，系统优先级高于应用，所以在这些场景下，即使在应用内调节音量，也无法触发出自己的音量视图。

然后上面所有问题都迎刃而解了。

最后推荐一个开源库：[VolumeBar](https://github.com/gizmosachin/VolumeBar)


