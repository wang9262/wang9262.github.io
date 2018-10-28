# 如何创建一个类似 Tinder 的交互动画

title: 如何创建一个类似 Tinder 的交互动画[译]
date: 2015-08-21 00:09:54
tags: 翻译
comments: true
category: 翻译
---

有时候我认为 Tinder 不仅仅让人们遇见彼此，更多的是它引领了一种交互设计趋势。所以我们非常肯定地说 Tinder 已经完成了他的历史使命，可以安心等待着下一个 Tinder 出现。
<!--more-->
原文:[How We Built Tinder-Like Koloda Animation in Swift](https://yalantis.com/blog/how-we-built-tinder-like-koloda-in-swift/)

Tinder 的右滑喜欢，左滑忽略不仅仅在约会（pao）应用中很流行，在购物 App 中也很流行，比如[Fancy](https://fancy.com/about)，也是像 Tinder 一样是滑动喜欢的形式。他们之所以才用这种交互形式是因为这种卡片式的交互确实深得用户欢心。卡片上的内容吸引了用户的注意力促使他们去进行一系列操作，进而提高了用户参与度。
还有许多不同种类 App 也是用这种像 Tinder 一样的卡片式滑动交互的例子，比如[Uptop](https://liveuptop.com/)，就连谷歌浏览器 iOS 客户端也是用这种卡片形式来管理书签。

![](http://img.cdn.punmy.cn/content_1__1_.gif)


我们把卡片式布局以及基于滑动的交互作为今年的交互设计趋势，我们的[这篇文章](https://yalantis.com/blog/7-up-to-date-mobile-app-design-trends-2015/)有相关介绍。之后我们的设计师Dmitry Goncharov创建了一个类似 Tinder 交互的动画，实际上他是故意这么做的。
我们把我们的这种类似 Tinder 基于卡片式的动画命名为`Koloda`，在乌克兰语中它的意思是甲板（卡片），听起来非常有趣。这个组件能够被不同 app 使用，如果加上约会（pao）地点的话，甚至在 Tinder 中也很实用。Dmitriy提出了这个概念，我们的iOS工程师实现了这个想法。详见[GitHub](https://github.com/Yalantis/Koloda)。（译者注：Objective-C 版详见[这里](https://github.com/wang9262/Koloda-ObjC)）。

## 我们如何实现 Koloda 动画

>- by Eugene Andreyev

Tinder的滑动喜欢界面被许多不同的 App 借鉴，也有一些现成的库来给开发者使用。首先，我看了[MDCSwipeToChoose](https://github.com/modocache/MDCSwipeToChoose)以及[TinderSimpleSwipeCards](https://github.com/cwRichardKim/TinderSimpleSwipeCards)，事实证明，它们并不能完美的实现我的需求。
我想要的动画要非常简单而且方便，就像UITableView 那样由数据源来驱动。因此，我创建了一个自定义组件来构建这个动画。主要分为如下三个部分：

- DraggableCardView：用来展示内容的卡片式图

- OverlayView：遮罩视图，根据用户手势方向（左、右）来动态改变
- KolodaView：用来控制加载和卡片之间的交互的视图
![](http://img.cdn.punmy.cn/content_2__1_.gif)


## DraggableCardView的实现
正如我前面提到的那样，`DraggableCardView`是用来展示内容的卡片视图。网上有很多教程阐述了 Tinder 滑动动画的原理，我选择了其中一种解决方案，做了一些改动，然后利用`UIPanGestureRecognizer` 和 `CGAffineTransform`实现了 `DraggableCardView`。部分代码如下：

```objc
//译者注：原文是用 swift 写的，我索性翻译成了 OC，下同

- (void)panGestureRecognized:(UIPanGestureRecognizer *)pan
{
    self.xDistanceFromCenter = [pan translationInView:self].x;
    self.yDistanceFromCenter = [pan translationInView:self].y;
    CGPoint location = [pan locationInView:self];
    switch (pan.state) {
        case UIGestureRecognizerStateBegan:
        {
            self.originalLocation = self.center;
            self.dragBegin = YES;
            
            self.animationDirection = location.y >= self.frame.size.height / 2 ? -1.0 : 1.0;
            
            self.layer.shouldRasterize = YES;

        }
            break;
        case UIGestureRecognizerStateChanged:
        {
            CGFloat rotationStrength = MIN(self.xDistanceFromCenter / self.frame.size.width, kRotationMax);
            CGFloat rotationAngle = self.animationDirection * kDefaultRotationAngle * rotationStrength;
            CGFloat scaleStrength = 1 - ((1 - kScaleMin) * fabs(rotationStrength));
            CGFloat scale = MAX(scaleStrength, kScaleMin);
            
            self.layer.rasterizationScale = scale * [UIScreen mainScreen].scale;
            
            CGAffineTransform transform = CGAffineTransformMakeRotation(rotationAngle);
            CGAffineTransform scaleTransform = CGAffineTransformScale(transform, scale, scale);
            
            self.transform = scaleTransform;
            self.center = CGPointMake(self.originalLocation.x + self.xDistanceFromCenter,
                                      self.originalLocation.y + self.yDistanceFromCenter);
            [self updateOverlayWithFinishPercent:self.xDistanceFromCenter / self.frame.size.width];
            if ([self.delegate respondsToSelector:@selector(cardView:draggedWithFinishPercent:)]) {
                [self.delegate cardView:self draggedWithFinishPercent:MIN(fabs(self.xDistanceFromCenter * 100 / self.frame.size.width), 100)];
            }
        }
            break;
        case UIGestureRecognizerStateEnded:
        {
            [self swipeMadeAction];
            self.layer.shouldRasterize = NO;
        }
            break;
        default:
            break;
    }
}
```

当用户拖拽最前面的卡片视图时,它就离事件触发边缘越来越近，当达到触发边缘时，它就从屏幕中消失了。到触发边缘的距离用百分比来表示。在顶部卡片视图被拖拽的过程中，底部的卡片也会有相应的动作，要么是放大要么是缩小。换而言之，顶层和底层的动画是同步的。
同样遮罩也会在移动的时候实时更新，在实时更新动画过程中，它的透明度从5%（几乎不可见）到100%（清晰可见）。

为了防止卡片边缘变得锯齿化，我使用了`layer`的`shouldRasterize`属性。同时我也要考虑到当卡片没有被拖拽到触发点时如何重置它的状态。我使用了 `Facebook` 的 [Pop](https://github.com/facebook/pop)框架来设置其重置状态以及恢复上一步(undo)的动画。如果你有印象的话，所有[Paper](https://www.facebook.com/paper)应用中的动画和过渡转换动画都是使用这个框架来完成的。它支持动态弹性动画，也允许创建任何物理现实中的交互动画，可喜的是它仅仅只需要很少的几行代码就可以实现。

## OverlayView的实现
`OverlayView`是在顶部卡片 View 进行动画时被添加上去的，它只有一个名为`overlayState`的属性，这个属性有两个可选值：当用户拖动卡片到左边，`overlayState`就添加一个红色的遮罩到卡片视图上，反之用户拖拽到右边，这个属性被设置为另一个可选值，使得卡片的遮罩变成绿色。（译者注：我在把代码翻译成 OC 时对变量名做了些许改动，`overlayState`改成了`type`，具体参见 GitHub，下同）。
为了实现遮罩的自定义行为，我们可以继承` OverlayView`，然后重载`overlayState`的` didSet`方法。大致代码如下：

```objc
//.h
#import <UIKit/UIKit.h>
#import "OverlayView.h"

@interface CustomOverlayView : OverlayView

@end
//.m
#import "CustomOverlayView.h"

@interface CustomOverlayView ()
@property (weak, nonatomic) IBOutlet UIImageView *imageView;

@end

@implementation CustomOverlayView

- (void)setType:(OverlayType)type
{
    switch (type) {
        case OverlayTypeLeft:

            self.imageView.image = [UIImage imageNamed:@"noOverlayImage"];
            break;
        case OverlayTypeRight:
            self.imageView.image = [UIImage imageNamed:@"yesOverlayImage"];
            break;
        case OverlayTypeNone:
        default:
            self.imageView.image = nil;
            break;
    }
}

@end
```

## KolodaView的实现
`KolodaView`类负责卡片的加载以及管理工作。你可以通过代码或者`Interface Builder`来实现。然后你就可以为其指定` dataSource`以及` delegate`(可选)。最后你应该实现` dataSource`中的如下方法：

```objc

@protocol SwipeViewDataSource <NSObject>

@required
- (NSUInteger)swipeViewNumberOfCards:(SwipeView *)swipeView;
- (UIView *)swipeView:(SwipeView *)swipeView
          cardAtIndex:(NSUInteger)index;
- (OverlayView *)swipeView:(SwipeView *)swipeView
        cardOverlayAtIndex:(NSUInteger)index;

@end
```

我们使用了代理方法而不是回调(block)的方式来获取相关数据。

## 几何解释
还记得我们关于开发安卓`Guillotine`菜单动画的[故事](https://yalantis.com/blog/how-we-developed-the-guillotine-menu-animation-for-android/)吗？在那个故事中我们的安卓工程师Dmytro Denysenko采用高中数学知识来计算一个自定义的差值。几何知识在我的 iOS 开发生涯中也发挥了很大的作用！

动画过程中最有趣的一件事就是当用户在拖拽顶部卡片时，下面的卡片也会跟着移动。我想让`Koloda`动画更加灵活，所以我简单地指定了想要在屏幕上展示的卡片数，然后我就拿出纸就开始计算。

![](https://yalantis.com/media/content/ckeditor/2015/07/02/img_2556_HD6OoTz.jpg)

`KolodaView`需要展示位于顶层卡片之下的卡片正确的数量，然后让它们在动画开始的时候占据正确的位置。为了实现它，我需要计算所有卡片的`frame`，这个是通过给其中每个元素添加对应的序号来实现的。举个例子，第一个卡片视图的序号是[i]，那么第二个就是[i+1],第三个就是[i+2],以此类推。
如下图所示，你可以清晰的看到第一张卡片的`frame`和`size`的计算过程。

![](https://yalantis.com/media/content/ckeditor/2015/07/02/cards_blueprint.jpg)

代码如下：

```objc
- (CGRect)frameForCardAtIndex:(NSUInteger)index
{
    CGFloat bottomOffset = 0;
    CGFloat topOffset = kBackgroundCardsTopMargin * (self.visibleCardsCount - 1);
    CGFloat xOffset = kBackgroundCardsLeftMargin * index;
    CGFloat scalePercent = kBackgroundCardsScalePercent;
    CGFloat width = CGRectGetWidth(self.frame) * pow(scalePercent, index);
    CGFloat height = (CGRectGetHeight(self.frame) - bottomOffset - topOffset) * pow(scalePercent, index);
    CGFloat multiplier = index > 0 ? 1.0 : 0.0;
    CGRect previousCardFrame = index > 0 ? [self frameForCardAtIndex:MAX(index - 1, 0)] : CGRectZero;
    CGFloat yOffset = (CGRectGetHeight(previousCardFrame) - height + previousCardFrame.origin.y
                       + kBackgroundCardsTopMargin) * multiplier;
    CGRect frame = CGRectMake(xOffset, yOffset, width, height);
    return frame;
}
```

现在我们知道了序号、卡片`frame`以及动画结束的百分比，我们就可以很轻松的计算出当上一个卡片被滑出屏幕时下一个卡片应该出现的位置。之后，我们也可以实现一个百分比驱动动画（PercentDrivenAnimation）。
最后我给这个简单易用的组件取了个有趣的名字--Koloda。任何开发者都可以自定义它，通过设置其内容视图以及遮罩视图。过些时候，我想实现自定义动画以及`frame`的计算方式，这样开发者们就可以使用他们自己别具一格的组件。
KolodaView 的代码详见[GitHub](https://github.com/Yalantis/Koloda)。

>- 译者注：ObjC 版本可以参见[Koloda-ObjC](https://github.com/wang9262/Koloda-ObjC)

