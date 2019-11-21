title: 如何创建一个翻书动画(Part2)[译]
date: 2015-09-01 23:11:46
tags: [UICollectionView,翻译]
comments: true
category: 翻译
---

欢迎回到 iOS 翻书动画教程系列！在该系列的[第一部分](http://www.raywenderlich.com/94565/how-to-create-an-ios-book-open-animation-part-1)([译文](http://t.cn/Ry2rWGG))，你已经知道如何创建自定义的 layout 以及如何在 app 中使用阴影效果来创建景深和模拟现实。在这篇教程中，你将学到如何创建一个自定义的转场以及如何使用 pinch 手势来打开书本。

<!-- more -->

> 2019.11.21 update
> 本文中图片和资源相关链接可能已失效，如需查阅，请查看原文
> 感谢[Attila Hegedüs](https://twitter.com/hegedus90)创建了这个棒棒哒示例工程。

![](http://cdn1.raywenderlich.com/wp-content/uploads/2015/05/BookOpening.gif)

原文：[How to Create an iOS Book Open Animation: Part 2](http://www.raywenderlich.com/?p=97690)

## 开始
这篇教程基于[第一部分](http://t.cn/Ry2rWGG)。如果你不了解第一部分或者想重新开始，可以下载上一教程的[完整代码](http://cdn1.raywenderlich.com/wp-content/uploads/2015/05/Part-1-Paper-Completed.zip)。

![](http://cdn1.raywenderlich.com/wp-content/uploads/2015/03/VN2_Start.gif)

在 Xcode 中打开工程。现在你可以选择一本书，然后书本从右滑出(即 push)，这是 UINavigationController 的默认转场行为。但是在这片教程结束的时候，自定义转场看起来像这样：

![](http://cdn2.raywenderlich.com/wp-content/uploads/2015/02/VN_BookOpening.gif)

自定义转场将在书本打开和合上的状态转换中进行丝滑的动画过渡，这种方式非常自然，深得我心。
来吧，骚年，开撸！

## 创建自定义导航控制器
想要实现自定义转场必须创建一个自定义的导航控制器然后实现 UINavigationControllerDelegate 协议。
右键 App 分组创建一个继承自 UINavigationController 名为 CustomNavigationController 的类。语言设置为 Swift。

打开CustomNavigationController.swift，用下面代码替换其内容：

```Swift
import UIKit
 
class CustomNavigationController: UINavigationController, UINavigationControllerDelegate {
 
  override func viewDidLoad() {
    super.viewDidLoad()
    //1
    delegate = self
  }
 
  //2
  func navigationController(navigationController: UINavigationController, animationControllerForOperation operation: UINavigationControllerOperation, fromViewController fromVC: UIViewController, toViewController toVC: UIViewController) -> UIViewControllerAnimatedTransitioning? {
    if operation == .Push {
      return nil
    }
 
    if operation == .Pop {
      return nil
    }
 
    return nil
  }
}
```
上面代码主要做了两件事：

- 1.在 viewDidLoad 方法中将代理设置为自身
- 2.navigationController(_:animationControllerForOperation:fromViewController:toViewController:) 方法是协议方法中的一个。这个方法在每次 push 或者 pop 的时候被调用，你可以在此返回对应的转场类型动画。现在这个方法返回 nil 使得其使用默认的标准转场。马上你就会用你自定义的转场类来替换它。

既然导航控制器已经准备就绪，那么让我们开始来替换 storyboard 中默认的导航控制器

设置如下图所示：

![](http://cdn4.raywenderlich.com/wp-content/uploads/2015/03/VN_storyboard2.png)

运行一下，确保能正常运行，一切正常，因为你在代理方法中返回 nil，导致控制器使用默认转场行为。

## 创建自定义转场
终于来到重头戏环节————撸一个自定义转场！
在自定义转场类中，必须遵循 UIViewControllerAnimatedTransitioning 协议，特别是需要实现下面几个方法：

- transitionDuration：必须实现。返回转场动画时间，以及同步交互转场动画
- animateTransition：必须实现。提供转场过程中的源控制器和目的控制器。自定义转场的工作重心主要是在这个方法中完成
- animationEnded：可选实现。在转场结束时调用。可以在该方法中还原之前的设置

## 设置你的转场
右键 App 分组新建一个继承自 NSObject 名为 BookOpeningTransition 的类，设置语言为 Swift。

打开它，然后用下面代码来替换其所有内容：

```Swift
import UIKit
 
//1
class BookOpeningTransition: NSObject, UIViewControllerAnimatedTransitioning {
 
  // MARK: Stored properties
  var transforms = [UICollectionViewCell: CATransform3D]() //2
  var toViewBackgroundColor: UIColor? //3
  var isPush = true //4
 
  //5
  // MARK: UIViewControllerAnimatedTransitioning
  func transitionDuration(transitionContext: UIViewControllerContextTransitioning) -> NSTimeInterval {
    return 1
  }
 
  func animateTransition(transitionContext: UIViewControllerContextTransitioning) {
 
  }
}
```
每个数字标号注释的解释：

- 1.BookOpeningTransition 实现了 UIViewControllerAnimatedTransitioning 协议
- 2.字典 transforms 存储了键为 UICollectionViewCell 值为 CATransform3D类型的键值对。当书本打开时，它存储了每个 cell 的 transform
- 3.定义了目的控制器的背景色，使得渐变看起来更加清爽
- 4.isPush 决定了转场为 push 还是 pop
- 5.添加了协议中必须实现的方法避免编译器报错。紧接着就是要实现这些方法

一切变量设置就绪，是时候来实现协议方法了。

用下面代码来替换 transitionDuration(_:) 中的内容：


```Swift
if isPush {
  return 1
} else {
  return 1
}
```
该方法返回了转场动画持续的时间，这里 pop 和 push都返回1秒。这个方法可以轻松改变转场动画的持续时间。
接下来需要实现第二个必须是闲的方法——animateTransition，这个方法让一切变得皆有可能。你将分两部分来实现：

写两个工具方法来分别实现 push 和 pop 的animateTransition。

## 创建 push 转场

回想一下实际生活中，你翻书的场景：

![](http://cdn2.raywenderlich.com/wp-content/uploads/2015/03/VN_PushStage.png)

看起来很复杂，但是你只需要关心动画的两种状态，然后让 UIView 的 animateWithDuration 方法来实现两种状态之间的过渡：

- 1.第一阶段：书被合上
- 2.第二阶段：书被打开

在实现 animateTransition(_:) 前，首先写一个工具方法来处理两种状态。还是在 BookOpeningTransition.swift 中，在最后添加：

```Swift
// MARK: Helper Methods
func makePerspectiveTransform() -> CATransform3D {
  var transform = CATransform3DIdentity
  transform.m34 = 1.0 / -2000
  return transform
}
```
该方法返回一个 transform，以及添加一个 z 轴上的透视。后面动画过程中你将会用到它来改变 view。

### 第一阶段——书本合起
接着在上述方法后面添加：

```Swift
func closePageCell(cell : BookPageCell) {
  // 1
  var transform = self.makePerspectiveTransform()
  // 2
  if cell.layer.anchorPoint.x == 0 {
    // 3
    transform = CATransform3DRotate(transform, CGFloat(0), 0, 1, 0)
    // 4
    transform = CATransform3DTranslate(transform, -0.7 * cell.layer.bounds.width / 2, 0, 0)
    // 5
    transform = CATransform3DScale(transform, 0.7, 0.7, 1)
   }
   // 6
   else {
     // 7
     transform = CATransform3DRotate(transform, CGFloat(-M_PI), 0, 1, 0)
     // 8
     transform = CATransform3DTranslate(transform, 0.7 * cell.layer.bounds.width / 2, 0, 0)
     // 9
     transform = CATransform3DScale(transform, 0.7, 0.7, 1)
    }
 
    //10
    cell.layer.transform = transform
}
```
我们对每一个页面做了转换使其与书脊对齐，然后翻页时围绕着个轴做旋转来达到真实的翻阅效果。首先你想要书本是合上状态。这个方法使得每个页面平铺在封面的底部。如下图所示：

![](http://cdn3.raywenderlich.com/wp-content/uploads/2015/03/VN2_ClosedState.png)

我们来解释一下上面的代码：

- 1.使用之前创建的工具方法初始化一个新的 transform
- 2.判断页面是否在书脊右侧
- 3.如果是右侧页面，设其角度为0，使其呈平铺状态
- 4.将页面居中并位于封面之下
- 5.使页面的x，y 均乘以0.7.如果你不知道为什么要乘以0.7，回想上一篇教程中你曾将封面缩小到0.7。
- 6.如果不是右侧页面，那就是左侧页面
- 7.设置左侧页面角度为180度。
- 8.使其位于封面之下，并居中
- 9.同5
- 10.设置 cell 的 transform

现在添加如下代码到上面方法之前：

```Swift
func setStartPositionForPush(fromVC: BooksViewController, toVC: BookViewController) {
  // 1
  toViewBackgroundColor = fromVC.collectionView?.backgroundColor
  toVC.collectionView?.backgroundColor = nil
 
  //2
  fromVC.selectedCell()?.alpha = 0
 
  //3
  for cell in toVC.collectionView!.visibleCells() as! [BookPageCell] {
    //4
    transforms[cell] = cell.layer.transform
    //5
    closePageCell(cell)
    cell.updateShadowLayer()
    //6
    if let indexPath = toVC.collectionView?.indexPathForCell(cell) {
      if indexPath.row == 0 {
        cell.shadowLayer.opacity = 0
      }
    }
  }
}
```
该方法设置了第一阶段的转场。它同时使用两个 VC 来做动画：

- fromVC：即书单 VC
- toVC：书页 VC

相关解释：

- 1.存储 BooksViewController 的 collectionView 的背景色，设置 BookViewController 中 collectionView 的背景色为 nil
- 2.隐藏选中书籍的封面，toVC 将会处理封面图片的呈现
- 3.遍历书本页面
- 4.保存每个 cell 打开状态下的transform
- 5.因为书本一开始是合上的，所以需要合上所有页面然后更新阴影层
- 6.最后忽略封面的阴影

### 第二阶端——打开书籍
我们已经完成第一阶段的过渡转场，是时候撸一撸第二阶段的了。第二阶段是有闭合到打开的状态。

在 setStartPositionForPush(_:toVC:)) 方法下添加如下代码：

```Swift
func setEndPositionForPush(fromVC: BooksViewController, toVC: BookViewController) {
  //1
  for cell in fromVC.collectionView!.visibleCells() as! [BookCoverCell] {
    cell.alpha = 0
  }
 
  //2
  for cell in toVC.collectionView!.visibleCells() as! [BookPageCell] {
    cell.layer.transform = transforms[cell]!
    cell.updateShadowLayer(animated: true)
  }
}
```
分析一下上面的代码：

- 1.隐藏所有书的封面，因为我们将展示选中书籍的页面。
- 2.遍历所有页面然后加载之前保存的打开状态下的 transform

当你从 BooksViewController push 到 BookViewController 之后，还原之前的一些设置。

加入以下代码：

```Swift
func cleanupPush(fromVC: BooksViewController, toVC: BookViewController) {
  // Add background back to pushed view controller
  toVC.collectionView?.backgroundColor = toViewBackgroundColor
}
```
push 完成后将 BookViewController 的背景色设置为你之前保存的背景色，将下面所有东西都隐藏起来。

## 实现开书转场
上面所有工具方法已经整装待发，接着我们来实现 push 动画。将下面代码加到 animateTransition(_:) 中：

```Swift
//1
let container = transitionContext.containerView()
//2
if isPush {
  //3
  let fromVC = transitionContext.viewControllerForKey(UITransitionContextFromViewControllerKey) as! BooksViewController
  let toVC = transitionContext.viewControllerForKey(UITransitionContextToViewControllerKey) as! BookViewController
  //4
  container.addSubview(toVC.view)
 
  // Perform transition
  //5
  self.setStartPositionForPush(fromVC, toVC: toVC)
 
  UIView.animateWithDuration(self.transitionDuration(transitionContext), delay: 0.0, usingSpringWithDamping: 0.7, initialSpringVelocity: 0.7, options: nil, animations: {
    //6
    self.setEndPositionForPush(fromVC, toVC: toVC)
    }, completion: { finished in
      //7
      self.cleanupPush(fromVC, toVC: toVC)
      //8
      transitionContext.completeTransition(finished)
  })
} else {
  //POP
}
```
下面解释一下上面代码做了哪些事：

- 1.获取容器视图，它在转场过程中充当父视图角色。
- 2.判断当前是执行 push 操作
- 3.获取 fromVC 和 toVC
- 4.将 toVC 加入到当前容器视图
- 5.设置闭合状态下 toVC 和 fromVC 的起始位置
- 6.从起始位置做动画，直到终点位置
- 7.还原设置
- 8.告知系统转场已完成

## 在导航控制器中使用 push 转场
上面我们已经实现了 push 转场动画，是时候来使用它了。打开 BooksViewController.swift 将下面属性添加到类声明之后：

```Swift
var transition: BookOpeningTransition?
```
这个属性是转场类实例，它帮助你判断当前转场是 push 还是 pop。添加如下扩展：

```Swift
extension BooksViewController {
func animationControllerForPresentController(vc: UIViewController) -> UIViewControllerAnimatedTransitioning? {
  // 1
  var transition = BookOpeningTransition()
  // 2
  transition.isPush = true
  // 3
  self.transition = transition
  // 4
  return transition
  }
}
```

- 1.创建一个 transition
- 2.设置 isPush 为 true
- 3&4.保存当前 transition，返回 transition

接着打开 CustomNavigationController.swift 用下面代码替换 push 的 if 判断

```Swift
if operation == .Push {
  if let vc = fromVC as? BooksViewController {
    return vc.animationControllerForPresentController(toVC)
  }
}
```
这一步判断判断是否从 BooksViewController 中 push 过来的，然后用你创建的 BookOpeningTransition 来做转场展示你的 BookViewController。

运行，选中某本书你会看到，书本在开、合之间的动画非常顺畅。

![](http://cdn2.raywenderlich.com/wp-content/uploads/2015/03/VN_PushGlitch.gif)

WTF...这货看起来没有动画？！

![](http://cdn5.raywenderlich.com/wp-content/uploads/2015/03/angry-desk-flip.png)

它直接从闭合状态跳转到打开状态，不要慌，这是因为你还没有加载页面 cell。
导航控制器从 BooksViewController 过渡到 BookViewController，他们两个都是继承自 UICollectionViewController。UICollectionViewCell 没有在主线程中加载，所以没有动画过程。
你需要给 collectionView 足够的时间让它来加载所有的 cell。
打开 BooksViewController.swift 然后使用下面代码替换 openBook(_:)：

```ObjectiveC
func openBook(book: Book?) {
  let vc = storyboard?.instantiateViewControllerWithIdentifier("BookViewController") as! BookViewController
  vc.book = selectedCell()?.book
  //1
  vc.view.snapshotViewAfterScreenUpdates(true)
  //2
  dispatch_async(dispatch_get_main_queue(), { () -> Void in
    self.navigationController?.pushViewController(vc, animated: true)
    return
  })
}
```
下面说下是如何解决这个问题的：

- 1.当转场要发生时告诉 BookViewController 去截取当前视图
- 2.确定是在主线程中 push，来给 cell 足够的时间进行加载

运行程序，应该和下图类似：

![](http://cdn3.raywenderlich.com/wp-content/uploads/2015/03/VN_PushGlitchAnimate.gif)

看起来更完美了。至此 push 的转场已经完成，继续撸 pop 的转场。
## 实现 Pop 转场的工具方法
pop 的过程和 push 过程刚好相反。第一阶段是书打开状态，第二阶段是书本闭合状态。

![](http://cdn2.raywenderlich.com/wp-content/uploads/2015/03/VN_PopState.png)

打开 BookOpeningTransition.swift 添加如下代码：

```Swift
// MARK: Pop methods
func setStartPositionForPop(fromVC: BookViewController, toVC: BooksViewController) {
  // Remove background from the pushed view controller
  toViewBackgroundColor = fromVC.collectionView?.backgroundColor
  fromVC.collectionView?.backgroundColor = nil
}
```
该方法存储了 BookViewController 的背景色然后移除了 BooksViewController 中 collectionView 的背景色。我们不需要设置任何的 transform，因为书本当前状态就是打开状态。
接下来添加如下代码到上述代码之后：

```Swift
func setEndPositionForPop(fromVC: BookViewController, toVC: BooksViewController) {
  //1
  let coverCell = toVC.selectedCell()
  //2
  for cell in toVC.collectionView!.visibleCells() as! [BookCoverCell] {
    if cell != coverCell {
      cell.alpha = 1
    }
  }      
  //3
  for cell in fromVC.collectionView!.visibleCells() as! [BookPageCell] {
    closePageCell(cell)
  }
}
```
该方法设置 pop 转场的最终状态：

- 1.获取当前选中书本的封面
- 2.在书本闭合状态，遍历 BooksViewController 所有书本封面，然后渐显
- 3.遍历 BookViewController 中所有的 cell，然后将它们转换成闭合态

然后加入以下代码：

```Swift
func cleanupPop(fromVC: BookViewController, toVC: BooksViewController) {
  // Add background back to pushed view controller
  fromVC.collectionView?.backgroundColor = self.toViewBackgroundColor
  // Unhide the original book cover
  toVC.selectedCell()?.alpha = 1
}
```
该方法在 pop 转场结束后做了一些还原工作。主要是将 BooksViewController 的 collectionView 的背景色还原成之前的状态，以及展示之前的书本封面。
把下面代码加到代理方法 animateTransition(_:) 中的 带有 `//POP` 注释的 else 大括号内。

```Swift
//1
let fromVC = transitionContext.viewControllerForKey(UITransitionContextFromViewControllerKey) as! BookViewController
let toVC = transitionContext.viewControllerForKey(UITransitionContextToViewControllerKey) as! BooksViewController
 
//2
container.insertSubview(toVC.view, belowSubview: fromVC.view)
 
//3
setStartPositionForPop(fromVC, toVC: toVC)
UIView.animateWithDuration(self.transitionDuration(transitionContext), animations: {
  //4
  self.setEndPositionForPop(fromVC, toVC: toVC)
}, completion: { finished in
  //5
  self.cleanupPop(fromVC, toVC: toVC)
  //6
  transitionContext.completeTransition(finished)
})
```
下面解释下 pop 转场动画的工作原理：

- 1.获取转场过程中的控制器。fromVC 现在变成了 BookViewController，toVC 变成了 BooksViewController。
- 2.在 containerView 中把 BooksViewController 的视图放置到 BookViewController 视图下面。
- 3.setStartPositionForPop(_:toVC) 方法存储了背景色
- 4.用动画形式将书本有打开状态转换到闭合状态
- 5.动画完成则做还原设置，将背景色设置为之前保存的，然后显示书本封面
- 6.通知转场完成

## 在导航控制器中使用 pop 转场
现在让我们像之前添加自定义 push 动画那样将 pop 动画也加入到代理方法中去。
打开 BooksViewController.swift 然后在 animationControllerForPresentController(_:) 方法后添加如下代码：

```Swift
func animationControllerForDismissController(vc: UIViewController) -> UIViewControllerAnimatedTransitioning? {
  var transition = BookOpeningTransition()
  transition.isPush = false
  self.transition = transition
  return transition
}
```
这个方法同样创建一个 BookOpeningTransition 实例，唯一不同的是其 transition 设置为 pop。
打开 CustomNavigationController.swift 用下面代码替换之前的 if 逻辑：

```Swift
if operation == .Pop {
  if let vc = toVC as? BooksViewController {
    return vc.animationControllerForDismissController(vc)
  }
}
```
它返回一个 transition，然后执行 pop 动画来把书合上。
运行程序，选中一本书，看下它的打开和闭合状态，应该和下图类似：

![](http://cdn5.raywenderlich.com/wp-content/uploads/2015/03/VN_OpenAndClose.gif)

## 创建一个可交互的导航控制器
打开和关闭转场动画看起来非常屌，但是你可以做得更好。你可以使用 pinch 手势来控制书的开、合。
首先打开 BookOpeningTransition.swift 添加如下属性：

```Swift
// MARK: Interaction Controller
var interactionController: UIPercentDrivenInteractiveTransition?
```
接着打开 CustomNavigationController.swift 然后添加如下代码：

```Swift
func navigationController(navigationController: UINavigationController, interactionControllerForAnimationController animationController: UIViewControllerAnimatedTransitioning) -> UIViewControllerInteractiveTransitioning? {
  if let animationController = animationController as? BookOpeningTransition {
    return animationController.interactionController
  }
  return nil
}
```
上述方法返回一个可交互的动画对象。它使得导航控制器控制着整个动画过程，这样用户就可以使用 pinch 手势来控制书本的开、合。
打开 BooksViewController.swift 在transition 变量下添加如下属性：

```Swift
//1
var interactionController: UIPercentDrivenInteractiveTransition?
//2
var recognizer: UIGestureRecognizer? {
  didSet {
    if let recognizer = recognizer {
      collectionView?.addGestureRecognizer(recognizer)
    }
  }
}
```
下面解释为什么要添加这几个变量：

- 1.interactionController 是一个 UIPercentDrivenInteractiveTransition 实例，它管理 VC 转场过程中自定义动画的出现和消失。这个可交互控制器同样依赖一个 transition animator。这个 animator 实现了 UIViewControllerAnimatorTransitioning 协议，你刚才创建的 BookOpeningTransition 就是干这件事的。iteractionController 可以控制 push 和 pop 的过程，如果想要了解更多细节可以参考[苹果官方文档](https://developer.apple.com/library/prerelease/ios/documentation/UIKit/Reference/UIPercentDrivenInteractiveTransition_class/index.html#//apple_ref/occ/instm/UIPercentDrivenInteractiveTransition/cancelInteractiveTransition)。
- 2.recognizer 是一个 UIGestureRecognizer 实例。你可以使用它来控制书本的开、合。

在 BooksViewController 扩展中的 animationControllerForPresentController(_:) 方法中添加如下代码，将其放在 transition.isPush = true 这一行之后：

```Swift
transition.interactionController = interactionController
```
这行代码让自定义导航控制器知道使用那一个交互控制器。
同样把上面在添加到  animationControllerForDismissController(_:) 方法中 transition.isPush = false 之后。
紧接着在 viewDidLoad() 中加入下面一行代码：

```Swift
recognizer = UIPinchGestureRecognizer(target: self, action: "handlePinch:")
```
它初始化了一个 UIPinchGestureRecognizer 实例，这个 pinch 手势的 action 是 handlePinch(_:)。

现在我们来实现 handlePinch(_:) 这个方法：

```Swift
// MARK: Gesture recognizer action
func handlePinch(recognizer: UIPinchGestureRecognizer) {
  switch recognizer.state {
    case .Began:
      //1
      interactionController = UIPercentDrivenInteractiveTransition()
      //2
      if recognizer.scale >= 1 {
        //3
        if recognizer.view == collectionView {
          //4
          var book = self.selectedCell()?.book
          //5
          self.openBook(book)
        }
      //6
      } else {
        //7
        navigationController?.popViewControllerAnimated(true)
      }        
    case .Changed:
      //8
      if transition!.isPush {
        //9
        var progress = min(max(abs((recognizer.scale - 1)) / 5, 0), 1)
        //10
	interactionController?.updateInteractiveTransition(progress)
	//11
      } else {
        //12
	var progress = min(max(abs((1 - recognizer.scale)), 0), 1)
        //13
	interactionController?.updateInteractiveTransition(progress)
      } 
    case .Ended:
      //14
      interactionController?.finishInteractiveTransition()
      //15
      interactionController = nil
    default:
      break
  }
}
```
对于 UIPinchGestureRecognizer，我们关心三种不同的状态：began，changed，end。

**begin状态**

- 1.初始化一个 UIPercentDrivenInteractiveTransition 对象
- 2.判断 scale， 也就是 pinch 手势移动的距离，看起是否大于等于1
- 3.如果是，确保手势发生在 colletionView 当中
- 4.获取当前手势所作用的书脊
- 5.执行 push 转场动画，显示书籍页面
- 6.如果小于1
- 7.执行 pop 动画来展示书本封面

**changed 状态**

- 8.判断当前转场是否为 push
- 9.如果正 push 到 BookViewController，获取用户 pinch 手势的百分比。将 pinch 手势缩小为其原始值的 1/5，这样用户更加容易控制转场过程
- 10.根据之前计算的白封闭更新 transition 完成状态的百分比。
- 11.如果当前转场不是 push，那肯定是 pop
- 12.当使用 pinch 手势控制书本关闭时，缩放比一定是从1变到0
- 13.最后更新 transition 的进度

**end 状态**

- 14.通知系统用户转场交互已完成
- 15.将交互 controller 置为 nil

最后，你需要实现 pinch-to-closed 状态。因此你需要将手势传递给 BookViewController，这样他就能自发进行 pop。

```Swift
var recognizer: UIGestureRecognizer? {
  didSet {
    if let recognizer = recognizer {
      collectionView?.addGestureRecognizer(recognizer)
    }
  }
}
```
当你在 BookViewController 中设置好手势时，它会马上被加到 collectionView 中区，这样我们就可以在用户合上书本的时候追踪 pinch 手势。
下面需要在 BooksViewController 和 BookViewController 之间进行手势的传递。
打开 BookOpeningTransition.swift 添加下面一行代码到 cleanUpPush(_:toVC) 方法中，并且将它放在设置背景色之后：

```Swift
// Pass the gesture recognizer
toVC.recognizer = fromVC.recognizer
```
当从 BooksViewController push 到 BookViewController后，你需要将手势回传。
加入下面代码到 cleanUpPop(_:toVC) 方法中，同样是放在设置背景色之后：

```Swift
// Pass the gesture recognizer
toVC.recognizer = fromVC.recognizer
```
运行程序，选中任意一本书然后使用 pinch 手势来控制书本的开、合。

![](http://cdn4.raywenderlich.com/wp-content/uploads/2015/03/VN_Pinching.gif)

用 pinch 收拾来控制书本的开合显得非常自然，同样可以让界面更加简洁，我们不再需要导航栏上的返回按钮，是时候来清理它了。

如下图设置即可：

![](http://cdn3.raywenderlich.com/wp-content/uploads/2015/03/Screen-Shot-2015-03-14-at-1.16.36-PM.png)

继续运行，可以看到导航栏不复存在画面变得更加简洁！:]

![](http://cdn2.raywenderlich.com/wp-content/uploads/2015/02/VN_BookOpening.gif)

## 何去何从
你可以在此下载[完整代码](http://cdn3.raywenderlich.com/wp-content/uploads/2015/05/Part-2-Paper-Completed_Final.zip)。在这系列教程中，你学会了如何使用自定义布局、自定义转场、使用手势来控制转场交互。
我希望你喜欢这篇教程并从中受益，我想在此感谢[Attila Hegedüs](https://twitter.com/hegedus90)创建了这个碉堡的项目。
如有任何疑问，请在下面留言指出。






