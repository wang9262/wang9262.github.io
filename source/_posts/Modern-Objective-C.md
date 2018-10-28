title: Modern Objective-C
date: 2017-04-21 20:51:41
tags: [Objective-C]
comments: true
category: 读书笔记
---

本文主要介绍一些 Objective-C 的一些新特性。
<!-- more -->

### 从一个 Bug 来说说 Objective-C 中的指定构造器
某天测试反馈，iOS8 点击按钮时弹出一个列表视图出现必现崩溃，看了下崩溃日志，是野指针导致导出乱崩，具体是 `[xxx collectionView:numberOfItemsInSection:] unrecognized selector send to instance xxxxx`。
连上设备调试，发现 `setupDataSource` 走了两次，由于调用栈非常类似，一开始没注意它调了两次，一直没找到问题所在。后面各种断点上去，发现 `setupDataSource` 方法被调用了两次，进一步 `commonInit` 被调用了两次。最后查看初始化代码，才发现调用 `convenience init method` 时，没有调 `designed init method`，并且调完之后又再调了一次 `commonInit`。具体看下代码：

```objc
@interface PanelView()
@property (nonatomic, strong) UICollectionView *collectionView;
@end

- (instancetype)initWithCoder:(NSCoder *)aDecoder {
    if (self = [super initWithCoder:aDecoder]) {
        [self commonInit];
    }
    return self;
}

- (instancetype)initWithFrame:(CGRect)frame {
    if (self = [super initWithFrame:frame]) {
        [self commonInit];
    }
    return self;
}

- (instancetype)initWithType:(PanelType)type {
    if (self = [super init]) {
        [self commonInit];
        self.type = type;
    }
    return self;
}

- (void)commonInit {
    self.colletionView = ...
    [self addSubview:self.colletionView];
    [self setupDataSource];
}
- (void)setupDataSource {
    DataSource *dataSource = [[DataSource alloc] initWithCollectionView:self.collectionView];
    dataSource.delegate = self;
    self.collectionView.dataSource = dataSource;
    self.dataSource = dataSource;
}

// 外面使用 initWithType: 做了初始化
```
由于调了两次 `commonInit`，导致创建了两个 `collectionView` 和 `dataSource`，由于第一次创建的 `dataSource` 没有持有者，被释放为 `nil`，而第一次创建的 `collectionView` 被加到视图层级当中被 `self` 持有，所以在第一个 `collectionView` 在执行调用数据源方法时，`dataSource` 为 `nil`，但是在 iOS9 之前 `UICollectionView` 和 `UITableView` 的 `delegate` 和 `dataSource` 属性用 `assign` 而非 `weak` 修饰，导致这一块内存被污染，继续调用时会出现野指针崩溃。

归根结底，就是初始化的姿势不对。

正确的姿势应该是：

1. 子类指定构造器必须调用父类指定构造器
2. 便捷构造器只能通过调用自身指定构造器来完成初始化
3. 指定构造器必须要用 `NS_DESIGNATED_INITIALIZER` 标示

可参考下图

![](http://img.cdn.punmy.cn/14912017895530.jpg)

> 图片出自 《The Swift Programming Language (Swift 3.0.1)》 Initialization - Syntax for Designated and Convenience Initializers 小节

关于指定构造器，iOS 自身内部实现也有一个 bug [UITableViewController subclass designated initializer Crash][]、[How to subclass UITableViewController in Swift][]。iOS8 下自定义一个 `UIViewController` 继承自 `UITableViewController`，然后自定义指定构造器，代码如下：

```objc
// 指定构造器
- (instancetype)initWithTitle:(NSString *)title {
    if (self = [super initWithStyle:UITableViewStyleGrouped]) {
        //....
    }
    return self;
}

- (instancetype)initWithNibName:(nullable NSString *)nibNameOrNil bundle:(nullable NSBundle *)nibBundleOrNil {
    return [self initWithTitle:nil];
}

- (instancetype)initWithStyle:(UITableViewStyle)style {
    return [self initWithTitle:nil];
}

// 外面调用，iOS8 下调用此段代码，必崩
// 所以 iOS8 最好不要继承自 UITableViewController
TestViewController *vc = [[TestViewController alloc] initWithTitle:@"Hello"];
```

#### 几个小问题
- **Question 1**: `instancetype` 和 `id` 两者有什么区别？

> `instancetype` 能够做到类型检测而 `id` 不行。前者仅可做方法返回值，不能作为参数，见示例代码 
比如如下代码：

```objc

@interface TestObjectA : NSObject

+ (id)createObjectA;
- (void)methodA;

@end

@interface TestObjectB : NSObject

+ (instancetype)createObjectB;
- (void)methodB;

@end

[[TestObjectA createObjectA] methodB];      // no compile error or warning but crash
[[TestObjectB createObjectB] methodA];      // compile error --> No visible @interface for 'TestObjectB' declares the selector 'methodA'
```

延伸问题：为什么`(id)initWithXXX:` 也可以做到类型检测？
> 类方法只要以 `alloc`、`new` 开头就会有关联返回类型（即类型检测）
> 实例方法只要以 `init`、`autorelease`、`retain`、`self` 开头就会有关联返回类型
> [Clang Language Extensions--Objective-C Features][]
> **Note**: ARC 下实测，实例方法只有 `init` 开头的才有关联返回类型。

- **Question 2**: 新建一个VC 文件同时勾选 `Also create XIB file` 后，初始化 `VC *vc = [[VC alloc] init]` 得到的是否和 `initWithNibName:bundle:` 初始化得到的 UI 一致？为什么？

> 是一致的，因为最终都会调到指定构造器 `initWithNibName:bundle:`，但此时 `nibName` 为 `nil`，关于 `nibName` 的相关设置文档是这么说的
> However, if you do not specify a nib name, and do not override the loadView method in your custom subclass, the view controller searches for a nib file using other means. Specifically, it looks for a nib file with an appropriate name (without the .nib extension) and loads that nib file whenever its view is requested. Specifically, it looks (in order) for a nib file with one of the following names:
If the view controller class name ends with the word ‘Controller’, as in MyViewController, it looks for a nib file whose name matches the class name without the word ‘Controller’, as in MyView.nib.
It looks for a nib file whose name matches the name of the view controller class. For example, if the class name is MyViewController, it looks for a MyViewController.nib file.

> 简单来说，如果没设置该属性也没有复写 `loadView` 方法，则系统有一套自己的寻找机制来看是否有对应的 xib 文件，如果有，则加载 xib 文件。

- **Question 3**: 如下代码输出的是什么？为什么？ 选自 [神经病院objc runtime入院考试][]

```objc
@interface TestSubclass : TestSuperclass
@end
@implementation TestSubclass
- (instancetype)init {
    self = [super init];
    if (self) {
        NSLog(@"%@", NSStringFromClass([self class]));
        NSLog(@"%@", NSStringFromClass([super class]));
    }
    return self;
}
@end
```

> 输出的都是 `TestSubclass`，因为两者的 receiver 都是 self。当我们给 super 发消息的时候，实际上是给 self 发消息，只不过在查找方法列表时会自动跳过当前类的方法列表，而从父类方法列表中开始查找。归根结底，最后产生的消息是 `objc_msgSendSuper(self, @selector(init));`。

- **Question 4**: 为什么我们初始化方法的写法都长这样？

```objc
@interface SomeClass : TestSuperClass
@end
@implementation
- (instancetype)init 
{
    if (self = [super init]) {
    }
    return self;
}
@end
SomeClass *aInstance = [[SomeClass alloc] init];
```
> 我们可以将上面代码拆成以下几个步骤：

> 1. `[SomeClass alloc]` 返回一个 `SomeClass` 的实例
> 2. 紧接着给 **步骤1** 生成的实例发 `init` 消息，所以 **init** 方法中的 self 为 **步骤1** 生成的实例
> 3. `[super init]` 实际上调用的是父类的初始化方法，在父类的方法中，**self** 依然是 **步骤1** 生成的实例，**对于这一点的理解很重要**
> 4. 父类的 `init` 方法要么做一些基本的初始化工作，要么修改 self，然后返回一个新的实例
> 5. 回到 SomeClass 的`init`方法中来，此时得到的要么是 **步骤1** 生成的实例，要么是新生成的实例。这就是为什么我们要加 if 判断的原因。

### 新增关键字及特性
#### Nullability

`nonnull/_Nonnull` 表达的意思是一样的，`nullable/_Nullable` 同理，只是修饰符的位置不同
`_Nonnull` 和 `_Nullable` 的位置和 C语言的 `const` 关键字位置一致。

```objc
// 写法1和2 表达的意思完全一致
// 写法1
- (AAPLListItem * _Nullable)itemWithName:(NSString * _Nonnull)name;
@property (copy, readonly) NSArray * _Nonnull allItems;
// 写法2
- (nullable AAPLListItem *)itemWithName:(nonnull NSString *)name;
@property (copy, readonly, nonnull) NSArray *allItems;
```

几个特例：
- `typedef` 类型由于可以从上下文中推断出它是空（nullable）或非空（nonnull），所以内部不需要写 `nullable` 或 `nonnull`。
- 复杂指针必须显式声明其是否可为空，比如指定一个指向非空对象的可空指针可声明为 `_Nullable id * _Nonnull`
- `NSError **` 类型通常为一个指向可空对象的可空指针。

为了避免重复写 `nonnull`，有一对宏 `NS_ASSUME_NONNULL_BEGIN` 和 `NS_ASSUME_NONNULL_END`，被这两个宏包裹的代码，默认都是 `nonnull`，如果可为空，则需显式声明为 `nullable` 或者 `_Nullable`。

`null_resettable`: 可被置 nil，但是调用 getter 时又会重新创建，可参考 `UIViewController` 的 `view` 属性 或者 `UIView` 的 `tintColor` 属性。

更多关于 Nullability 可参考：
> [Nullability and Objective-C][]
> [Difference between nullable, __nullable and _Nullable in Objective-C][]

#### __kindof
该关键字的出现可以很好的避免做强转，比如 `UIView`、`UITableView` 的如下方法/属性

```objc
// UIView.h
@property(nonatomic,readonly,copy) NSArray<__kindof UIView *> *subviews;
- (nullable __kindof UIView *)viewWithTag:(NSInteger)tag;
...

// UITableView.h
- (nullable __kindof UITableViewCell *)cellForRowAtIndexPath:(NSIndexPath *)indexPath;
@property (nonatomic, readonly) NSArray<__kindof UITableViewCell *> *visibleCells;

// 无警告，不需要做强转
UIlabel *textLabel = view.subviews.firstObject; 
CustomCell *cell = self.tableView.visibleCells.lastObject;
```

#### Generics
为了更好的桥接 Swift，Objective-C 新增了轻量级的泛型支持，之所以是轻量级泛型，是因为它只是编译时的泛型。目前 Swift 仅支持 NSArray,、NSDictionary、NSSet 这 3 个类的泛型桥接，其它类(含自定义)，不支持。
[Using Objective-C Lightweight Generics][]
##### __covariant
子类可赋给父类
##### __contravariant 
父类可赋给子类，目前没有想到适用的场景，`__kindof` 和这个有点类似，但是又不一样，`__kindof` 可直接修饰属性。
比如 `@property (nullable, nonatomic, strong) __kindof NSObject *object;`

协变和逆变的具体区别可参考，sunnyxx 的博客[2015 Objective-C 新特性][]

### \_\_attributes\_\_ 命令
#### 基本概念
`__attribute__` 命令是用来修饰 C/C++/Objective-C 中的代码片段，让它们拥有额外的属性，进而使编译器做出对应的优化或者为代码调用者提供有用的上下文（警告或提示）。进一步来讲，就是 `__attributes__` 命令为我们提供了阅读代码的上下文，便于编译器提前做出优化，达到事半功倍的效果。

#### 什么时候用
Twitter 官方博客是推荐，能用且可以提供额外上下文的地方就尽量用。这样不仅可以让编译器做优化，同时可以让其他阅读代码的人（包括你自己）受益匪浅。当你想用却又在犹豫该不该用时，就不要用了。

#### 怎么用
虽然上面说到在能够使用的地方尽量使用，但是也不能乱用、滥用。具体例子可以参考下面提到的 Twitter 官方博客。

最开始接触 `__attribute__` 命令是在 `PSPDFUIKitMainThreadGuard.m`，第一次看到这个的时候一脸懵逼，仅仅一个 `.m` 文件，就可以起到检测是否在主线程执行的作用，而且对项目毫无侵入。后面看了下源代码，然后每个方法都设置了一个断点，然后在非主线程操作 UI，看断点位置。结果运行后，就走到了一个方法：

```objc
// This installs a small guard that checks for the most common threading-errors in UIKit.
// This won't really slow down performance but still only is compiled in DEBUG versions of PSPDFKit.
// @note No private API is used here.
__attribute__((constructor)) static void PSPDFUIKitMainThreadGuard(void) {
    @autoreleasepool {
        for (NSString *selStr in @[PROPERTY(setNeedsLayout), PROPERTY(setNeedsDisplay), PROPERTY(setNeedsDisplayInRect:)]) {
            SEL selector = NSSelectorFromString(selStr);
            SEL newSelector = NSSelectorFromString([NSString stringWithFormat:@"pspdf_%@", selStr]);
            if ([selStr hasSuffix:@":"]) {
                PSPDFReplaceMethodWithBlock(UIView.class, selector, newSelector, ^(__unsafe_unretained UIView *_self, CGRect r) {
                    PSPDFAssertIfNotMainThread();
                    ((void ( *)(id, SEL, CGRect))objc_msgSend)(_self, newSelector, r);
                });
            }else {
                PSPDFReplaceMethodWithBlock(UIView.class, selector, newSelector, ^(__unsafe_unretained UIView *_self) {
                    PSPDFAssertIfNotMainThread();
                    ((void ( *)(id, SEL))objc_msgSend)(_self, newSelector);
                });
            }
        }
    }
}
```
具体代码就不分析了，就是 hook 了一些布局才会调用的函数，然后判断其是否在主线程。最有意思的是前面的修饰符`__attribute__((constructor))`，后面查阅资料才知道，该修饰符修饰的方法，在 `main()` 函数执行前， `+load` 方法执行后。

> constructor 和 +load 都是在 main 函数执行前调用，但 +load 比 constructor 更加早一丢丢，因为 dyld（动态链接器，程序的最初起点）在加载 image（可以理解成 Mach-O 文件）时会先通知 objc runtime 去加载其中所有的类，每加载一个类时，它的 +load 随之调用，全部加载完成后，dyld 才会调用这个 image 中所有的 constructor 方法。  
>[Clang Attributes 黑魔法小记][]

`__attribute__` 是编译器命令，后面会跟随两个括号对，主要是为了防止宏的歧义，方便宏的展开。

```objc
// +(void)load 执行之后，main() 执行之前，只对 C 方法生效
// 若有多个 constructor 且想控制优先级的话，可以写成 __attribute__((constructor(101)))
// 里面的数字越小优先级越高，1 ~ 100 为系统保留
__attribute__((constructor))
__attribute__((objc_requires_super)) // 子类复写时，必须先调用父类方法

// ---------- 
// 用于 @interface 或 @protocol，将类或协议的名字在编译时指定成另一个
__attribute__((objc_runtime_name("SomeClass")))
@interface Some : NSObject
@end

NSLog(@"%@", NSStringFromClass([Some class]));  // "SomeClass"
```

更多的 `__attribute__` 命令可参考：

> Twitter 官方博客：[__attribute__ directives in Objective-C][]
> NSHipster 关于 `__attribute__` 的讨论： [__attribute__][]

[UITableViewController subclass designated initializer Crash]:http://www.openradar.me/23709930
[How to subclass UITableViewController in Swift]:http://stackoverflow.com/questions/25139494/how-to-subclass-uitableviewcontroller-in-swift
[__attribute__ directives in Objective-C]:https://blog.twitter.com/2014/attribute-directives-in-objective-c
[Nullability and Objective-C]:https://developer.apple.com/swift/blog/?id=25
[Difference between nullable, __nullable and _Nullable in Objective-C]:http://stackoverflow.com/questions/32452889/difference-between-nullable-nullable-and-nullable-in-objective-c
[Using Objective-C Lightweight Generics]:https://useyourloaf.com/blog/using-objective-c-lightweight-generics/
[Clang Attributes 黑魔法小记]:http://blog.sunnyxx.com/2016/05/14/clang-attributes/
[__attribute__]:http://nshipster.com/__attribute__/
[Clang Language Extensions--Objective-C Features]:https://clang.llvm.org/docs/LanguageExtensions.html#objective-c-features
[神经病院objc runtime入院考试]:http://blog.sunnyxx.com/2014/11/06/runtime-nuts/
[2015 Objective-C 新特性]:http://blog.sunnyxx.com/2015/06/12/objc-new-features-in-2015/


