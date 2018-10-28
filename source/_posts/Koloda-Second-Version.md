title: Koloda动画第二版[译]
date: 2015-08-23 17:31:04
tags: 翻译
comments: true
category: 翻译
---

一个月前，我们发布了[how we developed Tinder-like Koloda in Swift](https://yalantis.com/blog/how-we-built-tinder-like-koloda-in-swift/)([如何创建一个类似 Tinder 的交互动画[译]](http://0.0.0.0:4000/2015/08/21/%E5%A6%82%E4%BD%95%E5%88%9B%E5%BB%BA%E4%B8%80%E4%B8%AA%E7%B1%BB%E4%BC%BC%20Tinder%20%E7%9A%84%E4%BA%A4%E4%BA%92%E5%8A%A8%E7%94%BB/))。在开发者与设计师社区这个动画都受到强烈的欢迎，所以我们决定继续改善它。
<!--more-->

原文：[Koloda Tinder-Like Animation Version 2.](https://yalantis.com/blog/koloda-tinder-like-animation-version-2-prototyping-in-pixate-and-development-in-swift/)

从我们发布第一个简单的 Koloda 动画后，我们的设计师Dmitry Goncharov坚持要实现他的下一个想法。同样，我们的 iOS 开发工程师，Koloda 动画创建者Eugene Andreyev承诺要让 frame 计算更加自定义化来让更多开发者在我们的 Koloda 动画上制作他们别具一格的组件。
所以这是 Koloda 故事的第二章。这一次我们将同时讨论设计和开发。同时你也可以在[Dribble](https://dribbble.com/shots/2189960-Koloda-Tinder-Like-component-for-IOS-Available-on-GitHub)以及[GitHub](https://github.com/Yalantis/Koloda)上查看该动画。

## 我们如何用 Pixate 制作 Koloda 原型
>- by Dmitry Goncharov

我被 Tinder-like 这个概念所鼓舞，决定详细阐述把 Koloda 转变为不同寻常动画的最原始的想法。可喜的是，几个小时后我有了一个新的想法。我的想法是去除底部层级，从背景中来加载下一个卡片。我在 PS 中设计了一个实物模型，然后在[Pixate](http://www.pixate.com/)中制作了原型。Pixate 是一个类似 InVisio、Marver、Origami 的设计工具。尽管在 Pixate 中设计原型比在 InVisio 中花了更多时间，但是Pixate做出的原型更加像一个原生应用。这个原型重造了我想要的卡片行为。

![](https://yalantis.com/media/content/ckeditor/2015/08/11/pixate.gif)

现在让我们来讲一下其中的过程。Pixate 工具栏中包含了layers、action kit、以及animations。在资源加载完成出现在 artboard 上后，你就可以在layer上开始工作了，然后继续创建交互。一开始我需要让卡片水平移动然后当他们跨越临界点时从屏幕当中飞出。在简单的动画帮助下，我实现了这个过程。同样我也让卡片改变它的透明度和在交互过程中进行旋转。

然后我要让一个新的卡片按照就像它从背景中加载一样出现，所以我需要对其进行拉伸和缩放。我设置了缩放比为3.5倍到1倍，3.5倍是卡片在背景中的大小。

[](https://yalantis.com/media/content/ckeditor/2015/08/11/tips.png)

为了有更好的效果，我加了一些弹性动画，然后它就大功告成了。至此，原型设计就完成了，接下来就是开发的事情了。下面我想总结一下我对 Pixate 的总体印象。
优点：

- 在移动设备上预览
- 原型处理简单
- 不需要有特定的动画基础知识
- 原型看起来更像原生 App
- 工程共享更加方便（可导出到电脑，外链，二维码）

缺点：

- 一个原型没有囊括整个 App 的功能，只是展示独立的功能和交互
- 一个单独的 artboard 不能容纳原型的所有界面
- 不能将原型导出为代码
- web 端应用有 bug
- 基础的 asset kit 非常有限
- 动画没有时间线

尽管有这么些缺点，但是 Pixate 是一个强大的工具，它能够设计师设计原生可点击的原型，创建导航模式以及屏幕间的交互。最重要的是，它能够让整个团队明白工程开发的整体方向。你可以观看[Jared Lodwick](https://www.youtube.com/channel/UCi0aGwdVsX6O4yw5JxpNGgQ)的视频教程来了解更多。

现在你已经知道一些关于 Koloda 的原型设计过程，是时候来谈谈我们如何开发出第二版动画的。

![](https://yalantis.com/media/content/ckeditor/2015/08/11/component.gif)

## 我们如何开发 Koloda v.2

>- by Eugene Andreyev

第一版和第二版动画的最主要的区别就是卡片的布局。新版动画中最前的卡片被放置在屏幕中间，下面的卡片在背景中拉伸。底部卡片不会随顶部卡片移动而做出响应，而是在顶层卡片被滑出时出现在屏幕中，出现过程中有一个弹性特效。
得益于 Dima 的原型，第二版更加容易开发。首先，Pixate 允许查看原型的所有交互，其次我可以通过 Pixate 来查看所有应用到的变化，以及它们的顺序。然后简单地讲它们写进代码中，不需要人为调整。
最后，第二版 Koloda 是一个旅行 app 的一部分，不像第一版那样全是摇滚。

第一版：

![](https://yalantis.com/media/content/ckeditor/2015/08/11/koloda_v1.gif)

## Koloda v.2的实现
为了实现 Dima 设计的动画，我需要用不同的方式来放置卡片，所以我将[上一篇文章](http://vonglo.me/2015/08/21/%E5%A6%82%E4%BD%95%E5%88%9B%E5%BB%BA%E4%B8%80%E4%B8%AA%E7%B1%BB%E4%BC%BC%20Tinder%20%E7%9A%84%E4%BA%A4%E4%BA%92%E5%8A%A8%E7%94%BB/)(KolodaView实现那一段)中的`frameForCardAtIndex`暴露在头文件中。在 KolodaView 的子类中我复写了这个方法，然后按如下方式来放置卡片：


```Swift
override func frameForCardAtIndex(index: UInt) -> CGRect {

       if index == 0 {

           let bottomOffset:CGFloat = defaultBottomOffset

           let topOffset:CGFloat = defaultTopOffset

           let xOffset:CGFloat = defaultHorizontalOffset

           let width = CGRectGetWidth(self.frame ) - 2 * defaultHorizontalOffset

           let height = width * defaultHeightRatio

           let yOffset:CGFloat = topOffset

           let frame = CGRect(x: xOffset, y: yOffset, width: width, height: height)

           return frame

       } else if index == 1 {

           let horizontalMargin = -self.bounds.width * backgroundCardHorizontalMarginMultiplier

           let width = self.bounds.width * backgroundCardScalePercent

           let height = width * defaultHeightRatio

           return CGRect(x: horizontalMargin, y: 0, width: width, height: height)

       }

       return CGRectZero

   }
```

发生了什么？我将 frontCard放置在KolodaView中间，然后拉伸背景卡片为其原始大小的1.5倍。

![](https://yalantis.com/media/content/ckeditor/2015/08/11/states.jpg)

## 背景卡片的弹性动画
因为背景卡片以弹性动画的方式出现，以及在移动过程中改变透明度，我写了一个新的代理方法：


```Swift
KolodaView - func kolodaBackgroundCardAnimation(koloda: KolodaView) -> POPPropertyAnimation?
```

在这个方法中，POPAnimation 被创建用来传给 Koloda。然后当用户滑动卡片时， Koloda 用它来给 frame 的改变做动画。如果代理方法返回 nil，意味着 Koloda 使用默认的动画。

下面代码就是这个代理方法的实现


```Swift
 func kolodaBackgroundCardAnimation(koloda: KolodaView) -> POPPropertyAnimation? {

       let animation = POPSpringAnimation(propertyNamed: kPOPViewFrame)

       animation.springBounciness = frameAnimationSpringBounciness

       animation.springSpeed = frameAnimationSpringSpeed

       return animation

   }
```

## 怎样阻止背景卡片移动？
同样我也添加了一个新的代理方法在新版的 Koloda 中

```Swift
func kolodaShouldMoveBackgroundCard(koloda: KolodaView) -> Bool
```

如果返回 false就意味着交互动画被禁用，背景卡片不会随着顶层卡片移动而移动。

下面就是返回 false 时的动画效果：

![](https://yalantis.com/media/content/ckeditor/2015/08/11/static_bg.gif)

这是返回 true 的动画效果

![](https://yalantis.com/media/content/ckeditor/2015/08/11/v2.gif)

希望你能喜欢第二版的 Koloda，尽情使用它吧！

- [Dribbble](https://dribbble.com/shots/2189960-Koloda-Tinder-Like-component-for-IOS-Available-on-GitHub)
- [GitHub](https://github.com/Yalantis/Koloda)


