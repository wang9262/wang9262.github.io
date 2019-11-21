title: UICollectionView自定义布局之风火轮[译]
date: 2015-08-31 20:19:46
tags: [UICollectionView,翻译]
comments: true
category: 翻译
---

现在有许多极具创造力的网站，几周前我碰巧浏览到一个名为[Form Follows Function](http://fff.cmiscm.com/)的网站，上面有各种交互动画。其中最吸引我的是网站上的导航转轮，转轮由各种交互体验海报组成。

<!-- more -->
![](http://img.cdn.punmy.cn/2019-11-21-15742622027530.jpg!wm)

原文：[UICollectionView Custom Layout Tutorial: A Spinning Wheel](http://www.raywenderlich.com/107687/uicollectionview-custom-layout-tutorial-spinning-wheel)

本教程将讲解如何使用自定义的 `UICollectionViewFlowLayout` 来再现那个导航风火轮。在开始之前，希望你有对 2D 转换、`UICollectionView` 及其自定义布局的基本知识。如果你对这些还不是很熟悉，推荐你先看看下面几篇教程。

- [UICollectionView Tutorial Part 1: Getting Started](http://www.raywenderlich.com/78550/beginning-ios-collection-views-swift-part-1)
- [UICollectionView Tutorial Part 2: Reusable Views and Cell Selection](http://www.raywenderlich.com/78551/beginning-ios-collection-views-swift-part-2)
- [Video Series: Collection Views](http://www.raywenderlich.com/video-tutorials#collectionview)
- [Video Series: Custom Collection View Layouts](http://www.raywenderlich.com/video-tutorials#CCVL)

通过学习该教程，你将了解到：

- 从头开始创建自定义`collectionView`的布局，而不是使用
`UICollectionViewFlowLayout`作为你的基类。
- view 在其 bounds 之外绕某点旋转

那么现在，让我们开搞吧。

## 开始

首先下载[模板](http://cdn2.raywenderlich.com/wp-content/uploads/2015/06/CircularCollectionView-Starter.zip)，在 Xcode 中打开，运行。你将看到一系列 cell，每个代表[书城](http://www.raywenderlich.com/store)中的一本书。

![](http://img.cdn.punmy.cn/2019-11-21-15742622193056.jpg!wm)

下面我们来看看工程目录结构，有一个 CollectionViewController、一个自定义 Cell，cell 中有一个 imageView。然后 VC 被这些 Cell填充。我们的任务就是创建一个UICollectionViewLayout子类来将这些 Cell 按照圆弧排列。

## 理论知识

下图是一个带有 cell 的风火轮。黄色区域是 iPhone 的屏幕，蓝色圆角矩形是 cell，红色虚线是你将要放置 cell 的圆弧。

![](http://img.cdn.punmy.cn/2019-11-21-15742622298263.jpg!wm)

你需要三个参数来创建这种排列：

- 1.圆弧半径（radius）
- 2.每个 cell 之间的角度（anglePerItem）
- 3.每个 cell 的角位置

你可能已经注意到，并非所有 cell 在屏幕当中能正常显示。

假设第0个 cell 的角度为 `x` 度，那么第1个 cell 的角位置为 `x + anglePerItem`,第二个为`x + anglePerItem * 2`，以此类推。第 n 个的角位置的计算公式如下：

```
angle_for_i = x + (i * anglePerItem)
```

下图展示的是角坐标系。0度代表中心，顺时针方向为正，逆时针方向为负。所以0度角的 cell 将处在正中央，完全垂直的方向。

![](http://img.cdn.punmy.cn/2019-11-21-15742622407382.jpg!wm)

现在你对理论知识有了一个全面的理解，让我们开始撸代码吧。

## Circular Collection View Layout

新建一个 swift 文件，取名CircularCollectionViewLayout，继承自UICollectionViewLayout。

![](http://img.cdn.punmy.cn/2019-11-21-15742622925513.jpg!wm)

点击下一步、创建。这个UICollectionViewLayout的子类将包含所有与位置相关的代码。
因为CircularCollectionViewLayout继承自UICollectionViewLayout而不是UICollectionViewFlowLayout，所以你需要处理所有布局过程而不是简单调用 super 中的实现。

我发现 FlowLayout 非常适合网格视图而非圆形布局。
在CircularCollectionViewLayout中，新建两个属性`itemSize`和`radius`。

```swift
let itemSize = CGSize(width: 133, height: 173)
 
var radius: CGFloat = 500 {
  didSet {
    invalidateLayout()
  }
}
```

当半径改变时你需要重新计算所有值，所以要在 `didSet` 中调用`invalidateLayout()`。在 radius 声明下面紧接着`anglePerItem`的定义：

```swift
var anglePerItem: CGFloat {
  return atan(itemSize.width / radius)
}
```

`anglePerItem`可以是你想要的任何值，但是公式要确保 cell 不要被分散的太开。
下一步，实现`collectionViewContentSize()`来声明你的 collectionView 的内容有多大：

```swift
override func collectionViewContentSize() -> CGSize {
  return CGSize(width: CGFloat(collectionView!.numberOfItemsInSection(0)) * itemSize.width,
      height: CGRectGetHeight(collectionView!.bounds))
}
```

内容高度与 collectionView 高度一致，但是宽度是`itemSize.width * numberOfItems`。
现在打开` Main.storyboard`，选中视图大纲中的Collection View，如下图所示

![](http://img.cdn.punmy.cn/2019-11-21-15742625946308.jpg!wm)

打开Attributes Inspector，将其 Layout 设置为自定义，将其 Class 设置为CircularCollectionViewLayout。

![](http://img.cdn.punmy.cn/2019-11-21-15742626021736.jpg!wm)

运行程序，你将发现除了一个可滑动区域外，屏幕上没有任何东西。但是它就是你想要的，因为这确保你正确地将 collectionView 的 Layout 设置为你自定义的 Class 即 CircularCollectionViewLayout。

![](http://img.cdn.punmy.cn/2019-11-21-15742626135318.jpg!wm)

## 自定义布局属性

除了新建一个新的布局子类，你还要新建一个继承自UICollectionViewLayoutAttributes的类来存储角位置以及锚点（anchorPoint）。
把下面代码加到CircularCollectionViewLayout.swift这个文件中，将其放在CircularCollectionViewLayout类声明上面。

```swift
class CircularCollectionViewLayoutAttributes: UICollectionViewLayoutAttributes {
  // 1
  var anchorPoint = CGPoint(x: 0.5, y: 0.5)
  var angle: CGFloat = 0 {
    // 2 
    didSet {
      zIndex = Int(angle * 1000000)
      transform = CGAffineTransformMakeRotation(angle)
    }
  }
  // 3
  override func copyWithZone(zone: NSZone) -> AnyObject {
    let copiedAttributes: CircularCollectionViewLayoutAttributes = 
        super.copyWithZone(zone) as! CircularCollectionViewLayoutAttributes
    copiedAttributes.anchorPoint = self.anchorPoint
    copiedAttributes.angle = self.angle
    return copiedAttributes
  }
}
```

- 1.我们需要一个锚点，因为旋转是围绕锚点而非中心。
- 2.当设置角度（angle）的时候，在内部设置其 transform 旋转 angle 弧度。同时我们想要右边的 cell 覆盖在左边的 cell 上，这个可以通过设置 zIndex 来实现。因为角度用弧度表示，我们将其扩大 1,000,000倍来确保相邻的值不会被四舍五入成同一个 zIndex 值，zIndex 是 Int 型的。
- 3.复写copyWithZone()来遵循NSCopying协议，因为在 collectionView 布局时，内部会拷贝布局属性。复写这个方法来确保复制过程中，`anchorPoint` 和 `angle`两个属性也会被拷贝。

下面我们回到CircularCollectionViewLayout中来实现 layoutAttributesClass()方法。

```swift
override class func layoutAttributesClass() -> AnyClass {
  return CircularCollectionViewLayoutAttributes.self
}
```

这一步是为了告知 collecttionView 你将使用CircularCollectionViewLayoutAttributes而不是默认的UICollectionViewLayoutAttributes。
为了持有布局属性，在所有属性声明之后创建一个名为`attributesList`的数组。

```swift
var attributesList = [CircularCollectionViewLayoutAttributes]()
```

## Preparing the Layout

当 collectionView 第一次展示在屏幕上时，Layout 的` prepareLayout()`方法将被调用。在每次布局生效时这个方法也会被调用。
这是布局过程中最重要的方法之一，因为这是创建和存储布局属性的入口。在CircularCollectionViewLayout添加如下代码：

```swift
override func prepareLayout() {
  super.prepareLayout()
 
  let centerX = collectionView!.contentOffset.x + (CGRectGetWidth(collectionView!.bounds) / 2.0)
  attributesList = (0..<collectionView!.numberOfItemsInSection(0)).map { (i) 
      -> CircularCollectionViewLayoutAttributes in
    // 1
    let attributes = CircularCollectionViewLayoutAttributes(forCellWithIndexPath: NSIndexPath(forItem: i,
        inSection: 0))
    attributes.size = self.itemSize
    // 2
    attributes.center = CGPoint(x: centerX, y: CGRectGetMidY(self.collectionView!.bounds))
    // 3
    attributes.angle = self.anglePerItem*CGFloat(i)
    return attributes
  }
}
```

简单来说，我们便利每一个 item，然后执行闭包。下面我们一行行来解释：

- 1.为每个 IndexPath 创建一个CircularCollectionViewLayoutAttributes实例，然后设置其大小（size）
- 2.将 item 放在屏幕中间
- 按弧度来旋转每个 item，旋转量为`anglePerItem * i`

>方法中的 map 是 Swift 标准库中的一部分，它创建了一个新的数组，数组中存储的是闭包的执行结果。你可以在[这篇文章](http://www.raywenderlich.com/82599/swift-functional-programming-tutorial)中了解更多。

我们还需要实现下面的方法，这些方法返回在给定矩形区域中的 item 布局属性，以及给定的 indexpath 的 item 布局属性。collectionView 在布局过程中将会多次调用这些方法，在用户滑动 collectionView 也会触发这些方法。为了保证其高效性，我们在`prepareLayout()`方法中缓存了这些布局属性。把下面代码加到`prepareLayout()`下面：

```swift
override func layoutAttributesForElementsInRect(rect: CGRect) -> [AnyObject]? {
  return attributesList
}
 
override func layoutAttributesForItemAtIndexPath(indexPath: NSIndexPath) 
    -> UICollectionViewLayoutAttributes! {
  return attributesList[indexPath.row]
}
```

第一个方法简单返回了整个布局属性数组，第二个方法返回了指定的 indexpath 对应的布局属性。这个方法非常 OK 因为我们的 item 数目比较小，但是通常我们会遍历数组来判断布局属性的 frame 是否与给定的矩形区域相交，然后返回与给定区域相交的布局属性。这使得 collectionView 在屏幕上只绘制这些 item，或者将要出现在屏幕上的 item。

运行，你会看到所有 cell 出现在屏幕上，但是它们是围绕自身来旋转而非外部的某个点。虽然它不是非常急需的效果，但是如果能做到确实挺酷的，你觉得呢？

![](http://img.cdn.punmy.cn/2019-11-21-15742626594604.jpg!wm)

你能猜到为什么会这样吗？

## 有人说是锚点吗？

你还记得上面我们说的 cell 的锚点吗？你还没有设置过它，上面的旋转效果远没达到我们希望得到的效果。

![](http://img.cdn.punmy.cn/2019-11-21-15742626864285.jpg!wm)

锚点是 CALayer 的一个属性，所有的旋转和缩放都是围绕着它而发生的。锚点的默认值是 center，就像上面的运行结果那样。
真正的锚点的 x 值应该为0.5，y 值应该为`radius + (itemSize.height / 2)`，因为锚点是在归一化坐标系中定义的，所以你要除以`itemSize.height`。

![](http://img.cdn.punmy.cn/2019-11-21-15742626990183.jpg!wm)

回到`prepareLayout()`，然后再 `centerX` 的定义下面定义`anchorPointY`：

```swift
let anchorPointY = ((itemSize.height / 2.0) + radius) / itemSize.height
```

在`map(_:)`闭包中的 return 上方添加如下代码：

```swift
attributes.anchorPoint = CGPoint(x: 0.5, y: anchorPointY)
```

接着打开open CircularCollectionViewCell.swift，然后复写`applyLayoutAttributes(_:)` ：

```swift
override func applyLayoutAttributes(layoutAttributes: UICollectionViewLayoutAttributes!) {
  super.applyLayoutAttributes(layoutAttributes)
  let circularlayoutAttributes = layoutAttributes as! CircularCollectionViewLayoutAttributes
  self.layer.anchorPoint = circularlayoutAttributes.anchorPoint
  self.center.y += (circularlayoutAttributes.anchorPoint.y - 0.5) * CGRectGetHeight(self.bounds)
}
```

这里你用父类实现来使用默认属性如 center 和 transform 但是因为锚点（anchorPoint）是一个自定义属性，我们需要手动使用它，同样我们也更新了 center.y 来补偿圆形布局中的anchorPoint.y变化。

运行程序，你会看到所有的 cell 按照圆形来布局了，但是滑动的过程中...等一下，发生了什么？它们被移出了屏幕而不是旋转！？

这使得找到想要的书变得非常困难。

![](http://img.cdn.punmy.cn/2019-11-21-15742627247360.gif!wm)

## 改善滑动效果

最具挑战性的布局 item 任务已经完成了，可喜可贺！:]

![](http://img.cdn.punmy.cn/2019-11-21-15742627484536.jpg!wm)

现在需要做的就是改变角度值来实现滑动。

回到CircularCollectionViewLayout，然后在底部添加下面代码：

```swift
override func shouldInvalidateLayoutForBoundsChange(newBounds: CGRect) -> Bool {
  return true
}
```

该方法返回 true 告知 collectionView 在滑动时布局失效，然后它会调用`prepareLayout()`，进而使用更新后的角位置重新计算 cell 的布局。angle被定义为第0个 item 的角位置。你将要通过把contentOffset.x转换成一个合适的角度值来实现滑动。

滑动过程中，`contentOffset.x`从 0 到`collectionViewContentSize().width - CGRectGetWidth(collectionView!.bounds)`变化。将`contentOffset.x`的极值定义为`maxContentOffset`，当其为 0 时，让第 0 个item 处在中心，当其为极值时（即maxContentOffset），让最后一个 item 处在屏幕中心，这就意味着最后一个 item 的角位置会变为 0 。

![](http://img.cdn.punmy.cn/2019-11-21-15742627839952.jpg!wm)

想象一下右边的场景，如果你是用`angle_for_last_item = 0`来解决下面等式你会得到：

```
angle_for_last_item = angle_for_zero_item + (totalItems - 1) * anglePerItem
0 = angle_for_zero_item + (totalItems - 1) * anglePerItem
angle_for_zero_item = -(totalItems - 1) * anglePerItem
```

定义`-(totalItems - 1) * anglePerItem`为`angleAtExtreme`，如下所示：

```swift
contentOffset.x = 0, angle = 0
contentOffset.x = maxContentOffset, angle = angleAtExtreme
```

由上面，使用下面的公式非常容易计算任意`contentOffset.x`对应的角度：

```
angle = -angleAtExtreme * contentOffset.x / maxContentOffset
```

脑海中回想以下这些算式，把下面代码添加到 itemSize 的声明下：

```swift
var angleAtExtreme: CGFloat {
  return collectionView!.numberOfItemsInSection(0) > 0 ? 
    -CGFloat(collectionView!.numberOfItemsInSection(0) - 1) * anglePerItem : 0
}
var angle: CGFloat {
  return angleAtExtreme * collectionView!.contentOffset.x / (collectionViewContentSize().width - 
    CGRectGetWidth(collectionView!.bounds))
}
```

接下来使用

```swift
attributes.angle = self.angle + (self.anglePerItem * CGFloat(i))
```

来替换`prepareLayout()`中的

```swift
attributes.angle = (self.anglePerItem * CGFloat(i))
```

这一步添加为每个 item 添加了角度值，这样 item 的角度值不在是一个常量，而是一个与`contentOffset.x`有着函数关系的值。
运行程序，在屏幕上滑动，你将发现所有 item 按照你想要的方式在滑动。干得漂亮！

![](http://img.cdn.punmy.cn/2019-11-21-15742628030765.gif!wm)


## 加分环节:优化

你已经成功的重现了风火轮导航，现在可以在拍拍自己肩膀说一句干得漂亮，然后架着二郎腿享受这美好时光。但是在存在优化空间的情况（滑动丝滑般流畅）下你为什么要停下来呢？
在`prepareLayout()`中为每个 item 创建了一个CircularCollectionViewLayoutAttributes实例，但是不是所有的 item 都会立刻展示在屏幕上。那些离屏的 item，你可以完全跳过对它们的计算，也不必创建CircularCollectionViewLayoutAttributes实例。
但是有一个棘手的问题是：我们需要确定哪些 item 正在屏幕上显示，哪些是离屏的。如下图所示，在 (-θ, θ)范围之外的所有 item 都是离屏的。

![](http://img.cdn.punmy.cn/2019-11-21-15742628334079.jpg!wm)

举个栗子，为了计算三角形 ABC 中的 θ 角，可以使用下面公式：

```
tanθ = (collectionView.width / 2) / (radius + (itemSize.height / 2) - (collectionView.height / 2))
```

在`prepareLayout()`中的`anchorPointY`下一行加入如下代码：

```swift
// 1 
let theta = atan2(CGRectGetWidth(collectionView!.bounds) / 2.0, 
    radius + (itemSize.height / 2.0) - (CGRectGetHeight(collectionView!.bounds) / 2.0))
// 2
var startIndex = 0
var endIndex = collectionView!.numberOfItemsInSection(0) - 1 
// 3
if (angle < -theta) {
  startIndex = Int(floor((-theta - angle) / anglePerItem))
}
// 4
endIndex = min(endIndex, Int(ceil((theta - angle) / anglePerItem)))
// 5
if (endIndex < startIndex) {
  endIndex = 0
  startIndex = 0
}
```

这一步我们做了什么？

- 1.使用反正切函数计算theta角
- 2.初始化`startIndex`及`endIndex`
- 3.如果第0个 item 的角位置小于 `-theta`，那么它就是离屏的，屏上第 1 个 item 的 `index` 将为 `-θ` 与 `angle` 的差值再除以 `anglePerItem`
- 4.同样的，屏幕上最后一个 item 是`θ` 与 `angle` 的差值再除以 `anglePerItem`，min 是保证`endIndex`不会越界
- 5.最后做了一个容错处理，防止在快速滑动时所有 cell 都离屏时导致 `endIndex`小于 `startIndex`的情况

下图把上面的计算过程可视化：

![](http://img.cdn.punmy.cn/2019-11-21-15742628443820.jpg!wm)

既然我们知道了哪些正在显示，哪些是离屏的，我们需要更新用来计算布局属性的起始和结束的 index。使用

```swift
attributesList = (startIndex...endIndex).map { (i) 
    -> CircularCollectionViewLayoutAttributes in
```

来替换`prepareLayout()`中的：

```swift
attributesList = (0..<collectionView!.numberOfItemsInSection(0)).map { (i) 
    -> CircularCollectionViewLayoutAttributes in
```

运行程序，你会发现视觉上没有明显变化，因为所有的改变仅仅影响离屏的 item。我们可以打开 Xcode [内置的视图层级查看器](http://www.raywenderlich.com/98356/view-debugging-in-xcode-6)

因为创建了更少的变量，你应该可以看到性能的提升。

![](http://img.cdn.punmy.cn/2019-11-21-15742628535614.jpg!wm)

## 何去何从

你可以[在此](https://koenig-media.raywenderlich.com/uploads/2015/06/CircularCollectionView-Final.zip)下载完整代码。

![](http://img.cdn.punmy.cn/2019-11-21-15742628626003.jpg!wm)

恭喜，你已经成功使用了自定义的 Layout 来实现一个导航风火轮。在这篇教程中你应该学到不少东西，包括如何旋转 view、改变锚点、从头创建自定义的 Layout 以及如何优化让它变得更好。
你可以更改`radius`和`anglePerItem`来进一步了解它们是如何来改变最终的圆形布局排列的。这篇教程主要是改变2D 的 transform，你也可以使用3D transform 来创建更有趣的效果。
同样你也可以通过复写`argetContentOffsetForProposedContentOffset(_:withScrollingVelocity:)`方法来实现snapping行为。
我相信你已经开始跃跃欲试了吧？如果你遇到问题，可以参考下面的代码：

```swift
override func targetContentOffsetForProposedContentOffset(proposedContentOffset: CGPoint, withScrollingVelocity velocity: CGPoint) -> CGPoint {
  var finalContentOffset = proposedContentOffset
  let factor = -angleAtExtreme/(collectionViewContentSize().width - 
      CGRectGetWidth(collectionView!.bounds))
  let proposedAngle = proposedContentOffset.x*factor
  let ratio = proposedAngle/anglePerItem
  var multiplier: CGFloat
  if (velocity.x > 0) {
    multiplier = ceil(ratio)
  } else if (velocity.x < 0) {
    multiplier = floor(ratio)
  } else {
    multiplier = round(ratio)
  }
  finalContentOffset.x = multiplier*anglePerItem/factor
  return finalContentOffset
}
```

如果你有任何疑问、评论或者炫技，请加入下面的讨论。