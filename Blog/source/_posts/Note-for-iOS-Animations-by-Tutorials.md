title: iOS Animations by Tutorials 2.0 笔记
date: 2016-08-27 00:08:21
tags: [笔记]
category: 读书笔记
---

这本书主要分成七个部分，二十七个章节，涵盖了从底层的 Core Animation 到上层的 UIView 的动画封装，AutoLayout 动画以及 ViewController 之间的转场动画。最后选择了两个开源动画库（[Easy Animation](https://github.com/icanzilb/EasyAnimation)、[pop](https://github.com/facebook/pop)）进行实践。本篇文章主要是在阅读、学习过程中的一些笔记，留下记录，日后忘记可以再来翻看。

<!-- more -->

## Section Ⅰ View Animation
这部分主要是关于 UIView 的动画，UIView 层次的动画是一些经过封装的上层 API，简单但是实用。基本都是日常用到的，比如位置、大小、透明度、旋转、关键帧动画等等，所以没啥好记录的。

### View 之间的过渡转场

主要是使用如下两个方法:


```ObjectiveC

+ (void)transitionWithView:(UIView *)view duration:(NSTimeInterval)duration options:(UIViewAnimationOptions)options animations:(void (^ __nullable)(void))animations completion:(void (^ __nullable)(BOOL finished))completion NS_AVAILABLE_IOS(4_0);

// toView added to fromView.superview, fromView removed from its superview
+ (void)transitionFromView:(UIView *)fromView toView:(UIView *)toView duration:(NSTimeInterval)duration options:(UIViewAnimationOptions)options completion:(void (^ __nullable)(BOOL finished))completion NS_AVAILABLE_IOS(4_0); 

```

## Section Ⅱ Auto Layout

这部分主要是 Auto Layout 的相关动画，首先基本介绍了它的使用，然后通过同一个 Demo 层层递进。总得来说，不管是手写还是 IB,布局虽然看似静态的，但是它也是能做动画的。

这一部分的动画，无非就是改了约束，然后把 `[view layoutIfNeeded]` 放到动画 block 里面。不过在这里学会了一招，就是在 IB 里面可以为约束设置标识（identifier）有点类似于 view 的 tag。

## Section Ⅲ Layer Animation
这一部分通过几个 Demo 来着重介绍 CALayer 及其几个常用的子类、CAAnimation 及其子类。其中使用 CAShapeLayer、CAGradientLayer、CAReplicatorLayer 的实例都比较有趣。
当 UIView 的那一套动画 API 已经无法满足需要时，这个时候应该转向更为底层的 Core Animation。UIView 的那一套动画 API 归根结底也是对 Core Animation 的封装。说白了，UIView 是 CALyaer 的 delegate.两者的具体区别如下:


| UIView | CALayer |
| :-: | :-: |
| 拥有复杂的视图布局及层级等 | 较简单的层级结构，所以能快速布局及绘制 |
| 可交互 | 不可交互 |
| 利用 CPU 在主线程做一些自定义绘制及其它逻辑 | 默认没有自定义逻辑，直接使用 GPU 绘制及缓存 |
| 灵活、实用 | - |


这里作者给出了选择 UIView 还是 Core Animation 来做动画的一些建议：

> choose view animations any time you can to do the job; you will know when you need more performance or flexibility and have to switch to layer animations instead.
Don’t stress yourself about it though, because you can mix and match view and layer animations freely.

简单来说就是在 UIView 满足需求的时候尽量使用 UIView，当追求更好的性能及灵活性时可以考虑使用 Core Animation.当然，两者也可以混合使用。

### fillMode 

这里借用书中的几张图来阐明一下各种模式

- **kCAFillModeRemoved**
img.cdn.punmy.cn
    默认模式：动画执行完毕后恢复原样

![QQ20160826-0@2x](http://img.cdn.punmy.cn/QQ20160826-0@2x.png)

- **kCAFillModeBackwards**img.cdn.punmy.cn

    动画开始前展示第一帧
![QQ20160826-1@2x](http://img.cdn.punmy.cn/QQ20160826-1@2x.png)

- **kCAFillModeForwards**
img.cdn.punmy.cn
    动画结束后 layer 维持最后一帧的状态

![QQ20160826-2@2x](http://img.cdn.punmy.cn/QQ20160826-2@2x.png)

- **kCAFillModeBoth**
img.cdn.punmy.cn
    是上面两种模式的结合，动画开始前维持第一帧，动画结束后维持最后一帧

![QQ20160826-3@2x](http://img.cdn.punmy.cn/QQ20160826-3@2x.png)

### Layer 弹性动画
这一节以钟摆举例，来解释弹性阻尼动画的相关属性。

- **damping**

    阻尼？不知道是不是这么翻译，主要是由空气摩擦、机械摩擦以及其它外界阻力造成的。    
- **mass**

    惯性？物体的质量越大，振荡时间越长。
- **stiffness**

    重力加速度（G）
- **initial velocity**

    初始速度，开始运动前，外界的推（拉力）产生的速度
img.cdn.punmy.cn
某些情况下，UIView 的弹性阻尼动画看起来胡比较生硬，因为在指定的 `duration` 内无法停下来，而被系统强制停下来，所以看起来很生硬。就如下图：

![QQ20160826-4@2x](http://img.cdn.punmy.cn/QQ20160826-4@2x.png)

如果 `duration` 为0.25，此时本应该还有振荡，但是动画时间已到，只能强制停止振荡，进而使动画看起来略微生硬。所以 `CASpringAnimation` 里面有一个属性叫做 `settlingDuration`,该属性表示所有动画参数设定好之后，振荡完成是所需时间，如果将 `duration` 设置成这样，那么动画看起来就会很自然。

> 友情提示：请在设置好所有弹性振荡参数之后再设置 `duration`.

## Section Ⅳ 3D Animations
这部分主要通过一个侧拉菜单的 Demo 讲解了 3D 动画该如何实现。关键还是在于 CATransform3D 中的 m34 以及配合改变 anchor point,要想让视图看起来具有 3D 透视效果，可以将 m34 设置为 -1.0 / [camera distance], 分母代表相机离视图的距离。

关于距离选值与透视效果的明显程度可参见下表：


| distance |  |
| :-: | :-: |
| 0.1~500 | 失真较严重 |
| 700~2000 | 效果最好，逼真 |
| >2000 | 几乎没有透视效果 |

## Section Ⅴ Further Types of Animations
这部分主要是讲一些其它动画的延伸，比如粒子动画、ImageView 的帧动画。
粒子动画主要使用 CAEmitterLayer 来做，具体细节可以参考 CAEmitterLayer 的 API。
帧动画主要是讲解 UIImageView 关于使用图片数组产生帧动画的效果，基本就是改变其 animationDuration 来达到控制帧率的效果。

## Section Ⅵ View Controller Transitions
这一部分主要是将视图控制器之间过渡的转场效果动画。关于这里，不再过多记录，毕竟关于 VC 之间的转场效果 GitHub 上一抓一大把了，随便拿一个读一读源码即可，万变不离其宗。

## Section Ⅶ Third-Party Animation Libraries
这部分主要是两个开源动画库的使用，找个时间读一读源码，另外再写一篇文章。


