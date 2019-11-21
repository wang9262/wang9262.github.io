title: WebView 与 JS 的交互
date: 2015-10-19 00:14:41
tags: [WebView,原创]
category : 框架学习
---

本文主要分析一些 iOS 中 WebView 与 JavaScript 交互的一些框架。

<!-- more -->

### UIWebView 调 JS 方法

通过调用如下方法：

```ObjectiveC
- (NSString *)stringByEvaluatingJavaScriptFromString:(NSString *)script;
```
比如获取网页 title，也可以动态注入 JS，先写一个 JS 函数

```JavaScript
function showAlert() {  
    alert('show alert');  
} 
```
然后保存为js 文件，最后读取这个文件并注入

```ObjectiveC
NSString *filePath = [[NSBundle mainBundle] pathForResource:@"test" ofType:@"js"];  
NSString *jsString = [[NSString alloc] initWithContentsOfFile:filePath];  
[webView stringByEvaluatingJavaScriptFromString:jsString];
```

### JS 调原生方法

直接调用无法做到，可以间接实现。
#### 方法1
JS 中要从现在的网页跳到另外一个网页的时候，就会去修改 `window.location.href` ，而在 `@protocol UIWebViewDelegate` 中有一个回调方法

```ObjectiveC
- (BOOL)webView:(UIWebView *)webView shouldStartLoadWithRequest:(NSURLRequest *)request navigationType:(UIWebViewNavigationType)navigationType;
```
可以监听到网页的跳转，所以可以在此做文章。
通过指定`window.location.href = schemename://nativemethodname:args`就可以去间接调用到原生函数。JS 一旦修改了`window.location.href`，`UIWebView`就会收到相应回调，也就是上面说的方法，这样我们可以通过判断` request`的`url`是否为自定义的 `scheme`来决定是否调用原生函数。

#### 方法2
创建iframe，设置src，并插入到body节点

```JavaScript
function execute(url) 
{
  var iframe = document.createElement("IFRAME");
  iframe.setAttribute("src", url);
  document.documentElement.appendChild(iframe);
  iframe.parentNode.removeChild(iframe);
  iframe = null;
}
execute("schemename://nativemethodname:args");
```

上述的这一串`schemename://nativemethodname:args`由客户端和前端约定好即可。剩余的事就是截获这个`request`，然后解析得到相应的参数，传入要调用的原生函数即可。同时在回调方法中要`return NO`。
大致代码如下：

```ObjectiveC
- (BOOL)webView:(UIWebView *)webView shouldStartLoadWithRequest:(NSURLRequest *)request navigationType:(UIWebViewNavigationType)navigationType
{
    NSURL *requestUrl = request.URL;
    if ([requestUrl.scheme isEqualToString:@"schemename"]) {
            NSArray *components = [requestUrl.absoluteString componentsSeparatedByString:@":"];
            NSString *resultJSONString = [components[2] stringByReplacingPercentEscapesUsingEncoding:NSUTF8StringEncoding];
            [self customMethod:resultJsonString];
            return NO;
        }
   return YES;
}

```
 
### WebViewJavaScriptBridge

![](http://img.cdn.punmy.cn/2019-11-21-15743466661142.jpg!wm)

#### 实现原理
大致原理与上面说的一致。只不过`WebViewJavaScriptBridge`进行了更完善的封装，使得 `JS`与`Native`之间的通信变得更为简便。

一开始注入`WebViewJavaScriptBridge.js`,该文件中的` JS`方法主要做了以下几件事

- 创建了一个用于发送消息的iFrame(通过创建一个隐藏的`ifrmae`，并设置它的URL 来发出一个请求，从而触发UIWebView的`shouldStartLoadWithRequest`回调协议)
- 创建了一个核心对象`WebViewJavaScriptBridge`，并给它定义了几个方法，这些方法大部分是公开的API方法
- 创建了一个事件：`WebViewJavaScriptBridgeReady`，并`dispatch`。##

`native`将方法名、参数、回调的id放到一个对象中传给`js`。`js`根据方法名字调用相应方法，之后将返回数据和`responseId`拼装，最后通过`src` 重定向到`UIWebview` 的`delegate`。`native`得到数据后根据`responseId`调用事先装入`_responseCallbacks`的`block`，动态读取调用，从而完成交互。

#### 流程（Native端）

##### Public Interface

```ObjectiveC
+ (instancetype)bridgeForWebView:(WVJB_WEBVIEW_TYPE*)webView handler:(WVJBHandler)handler;
+ (instancetype)bridgeForWebView:(WVJB_WEBVIEW_TYPE*)webView webViewDelegate:(WVJB_WEBVIEW_DELEGATE_TYPE*)webViewDelegate handler:(WVJBHandler)handler;
+ (instancetype)bridgeForWebView:(WVJB_WEBVIEW_TYPE*)webView webViewDelegate:(WVJB_WEBVIEW_DELEGATE_TYPE*)webViewDelegate handler:(WVJBHandler)handler resourceBundle:(NSBundle*)bundle;
+ (void)enableLogging;
- (void)send:(id)message;
- (void)send:(id)message responseCallback:(WVJBResponseCallback)responseCallback;
- (void)registerHandler:(NSString*)handlerName handler:(WVJBHandler)handler;
- (void)callHandler:(NSString*)handlerName;
- (void)callHandler:(NSString*)handlerName data:(id)data;
- (void)callHandler:(NSString*)handlerName data:(id)data responseCallback:(WVJBResponseCallback)responseCallback;
```
##### 初始化一个 bridge
初始化的工作主要如下：

- 设置默认的消息处理 block ———— messageHandler
- 初始化用来保存消息处理 block 的字典 ———— messageHandlers
- 初始化消息队列数组 ———— startupMessageQueue
- 初始化响应回调 ———— responseCallbacks
- 以及初始化全局唯一标识 ———— uniqueId

当在外部调用 

```ObjectiveC
- (void)registerHandler:(NSString *)handlerName handler:(WVJBHandler)handler;
```
方法时，会将 handler 保存到上面初始化好的 messageHandlers 当中，key为上述方法中的 handlerName，value 为上述方法的 handler。

```ObjectiveC
- (void)sendData:(id)data responseCallback:(WVJBResponseCallback)responseCallback handlerName:(NSString*)handlerName; 
```

发送消息时，会将消息加入到消息队列数组，加到数组当中的object 为字典型，字典有三个 key，分别为 data，callbackId， handlerName，分别对应上述方法的三个参数。入队时，如果当前消息队列存在，则将该消息入队，否则立即分发该消息。

##### 网页加载过程

```ObjectiveC
- (BOOL)webView:(UIWebView *)webView shouldStartLoadWithRequest:(NSURLRequest *)request navigationType:(UIWebViewNavigationType)navigationType;
```
加载请求或 html 时，在 shouldStartLoadWithRequest 回调中会先判断请求是否带自定义协议。如果带有自定义协议，会调用注入的 js 中 WebViewJavaScriptBridge 的_fetchQueue 方法来获取当前消息，然后分发该消息。主要是在分发消息这一块，拿到消息 json 然后序列化，如果这个消息是队列(数组)才进行处理，消息队列中也是一系列字典型对象，这些对象可能有这么几个key：responseId，responseData，callbackId，handlerName，data。
然后对消息队列做一个遍历大致逻辑如下：

- 如果 responseId 对应的 value 存在，那么就到 responseCallbacks 字典中去寻找对应的 WVJBResponseCallback 型回调 block，然后执行，block 参数为 responseData 对应的 value。然后把这个 block 从 responseCallbacks 字典中移除。
- 如果 responseId 对应的 value 不存在，再看 callbackId 对应的 value 是否存在，存在则设置回调 responseCallback，这个 responseCallback 主要是创建一个消息，然后是消息入队，这个消息字典为 `@{ @"responseId":callbackId, @"responseData":responseData }`；反之 responseCallback 中什么也不执行；最后判断 handlerName 对应的 value 是否存在，存在则取 messageHandlers 中对应的回调 handler，不存在就是用默认的 handler，最后执行这个 WVJBHandler 型的 handler，参数为 data 对应的 value 以及 responseCallback。

文字有点多，参考下下面这个流程图：

![](http://img.cdn.punmy.cn/2019-11-21-15743466818699.jpg!wm)

```ObjectiveC
- (void)webViewDidFinishLoad:(UIWebView *)webView;
```
加载结束的回调中判断 js 是否初始化了 WebViewJavaScriptBridge实例，如果不存在，就注入本地的 js。然后检测到 bridge 调用自定义 scheme 后会分发整个消息队列即 startupMessageQueue，遍历消息队列然后取出每一个消息对象(NSDictionary) 然后将其序列化成 JSON，在主线程中调用 JS 的 WebViewJavaScriptBridge._handleMessageFromObjC 方法，参数就是序列化后的 JSON 数据。分发完成后，将 startupMessageQueue 队列置为 nil。

至此 OC 端的整个流程完毕。

#### JS 端流程

JS 端流程和 OC 端流程大致是一样的
##### Public Interface

```JavaScript
function init(messageHandler)
function send(data, responseCallback)
function registerHandler(handlerName, handler)
function callHandler(handlerName, data, responseCallback)
function _fetchQueue()
function _handleMessageFromObjC(messageJSON)
```

##### 初始化
类似 OC 中的初始化

- 注入一个默认的 messageHandler
- 初始化一个消息接收队列，然后调用内部方法 _dispatchMessageFromObjC 来分发消息,同时将消息接收队列置空

##### 发送消息
调用内部 `function _doSend(message, responseCallback)` 函数，该函数通过判断 responseCallback 回调是否存在，存在则将这个回调存入到 responseCallbacks 字典中，其 key 是全局唯一的，同时将这个 key 存入到 message 这个字典参数中，其 key 和 value 一致，及 message['key'] = key。接着把这个 message 参数入队即加到 sendMessageQueue 数组中。然后重定向 frame 的 src，这样 OC 端就可以在代理回调方法中去拦截这个 src 对应的 request。

##### 消息处理机制
如果消息接受队列存在则将消息 JSON 入队即添加到 receiveMessageQueue 数组中。反之，调用内部消息分发方法

```JavaScript
function _dispatchMessageFromObjC(messageJSON)
```
分发机制类似 OC 端的那张流程图，在此不做详述。
##### 注册及调用 handler

- 注册：在 messageHandlers 这个字典添加对应的 key 和 value。key 为 name，value 为 handler
- 调用：类似发送消息，message 参数为 { handlerName:handlerName, data:data }

##### 获取消息队列(供 OC 端调用)
这里会将消息发送数组进行 JSON 转化，转换后清空消息队列，然后返回给 OC 端。

##### 内部注入的 JS
上面说的所有都在内部注入的 JS(WebViewJavaScriptBridge.js.txt) 中完成,该 JS 做的事情在上述的实现原理中也有提到，这里不再展开。

##### 外部 html 或 js 需要处理的事
可参考下例的写法：

```JavaScript
document.addEventListener('WebViewJavascriptBridgeReady', function(event) {
    var bridge = event.bridge
    // Start using the bridge
}, false)
```
可将上述代码封装到一个 JS 函数中，然后在函数中进行其它一系列操作，如init，send 等具体参见 [Demo](https://github.com/marcuswestin/WebViewJavascriptBridge)。

### JavaScriptCore(iOS7 & OS X 10.9 later)

#### 主要的类:

- JSVirtualMachine：非常轻量，可初始化多个 VM 来支持 JS 中的多线程
- JSContext：给 JS 提供运行上下文环境以及一系列值操作(通过下标来获取，类似 NSdictionary，即context[@"objectKey"])，一个 VM 中可有多个 context
- JSValue：数据桥梁
- JSManagedValue：用于解决 retain cycle

#### OC 调用 JS

JSContext 可调用 `evaluateScript:` 方法来执行某个脚本如下：

```ObjectiveC
[context evaluateScript:@”var square = function(x) {return x*x;}”]; 
JSValue *squareFunction = context[@”square”]; NSLog(@”%@”, squareFunction);  // function (x) {return x*x;}
JSValue *aSquared = [squareFunction callWithArguments:@[context[@”a”]]]; NSLog(@”a^2: %@”, aSquared); //a^2: 25
JSValue *nineSquared = [squareFunction callWithArguments:@[@9]]; 
NSLog(@”9^2: %@”, nineSquared); //81

```

#### JS 调用 OC

两种方式：

- Block
- JSExport 协议

##### Block

```ObjectiveC
context[@"factorial"] = ^(int x) {
        int factorial = 1;
        for (; x > 1; x--) {
            factorial *= x;
        }
        return factorial;
    };
[context evaluateScript:@"var fiveFactorial = factorial(5);"];
JSValue *fiveFactorial = context[@"fiveFactorial"];
// 5! = 120
NSLog(@"5! = %@", fiveFactorial);
```
值得注意的是：

- 不要在 block 中持有 JSValue，而是应该将JSValue 作为参数来传递
- 不要在 block 中持有 JSContext，可通过 `[JSContext currentContext]`来获取当前 context


```ObjectiveC
JSContext *context = [[JSContext alloc] init];context[@"callback"] = ^{
	//错误示例      JSValue *object = [JSValue valueWithNewObjectInContext:context];
     //正确的姿势
     JSValue *object = [JSValue valueWithNewObjectInContext:        [JSContext currentContext]];     object[@"x"] = 2;     object[@"y"] = 3;     return object;};
```

##### JSExport 协议
如果没有这个协议，OC 端的修改会同步到 JS 端，但是 JS 端的修改对 JS 和 OC 均无影响。见下例

```ObjectiveC
//TestModel.m
- (NSString *)description
{
    NSString *str = [@"TestModel With testString:" stringByAppendingString:self.testString];
    return [str stringByAppendingString:[NSString stringWithFormat:@" and numberStr:%@",self.numberStr]];
}

// viewDidLoad
TestModel *model = [[TestModel alloc] init];
model.testString = @"test string";
model.numberStr = @"123";
JSContext *context = [[JSContext alloc] initWithVirtualMachine:[[JSVirtualMachine alloc] init]];
context[@"model"] = model;
JSValue *modelValue = context[@"model"];
// model: TestModel With testString:test string and numberStr:123
NSLog(@"model: %@",model);
// model JSValue: TestModel With testString:test string and numberStr:123
NSLog(@"model JSValue: %@",modelValue);
model.numberStr = @"456";
// model: TestModel With testString:test string and numberStr:456
NSLog(@"model: %@",model);
// model JSValue: TestModel With testString:test string and numberStr:456
NSLog(@"model JSValue: %@",modelValue);
[context evaluateScript:@"model.testString = \"anotoher test\";model.numberStr = \"789\""];
// model: TestModel With testString:test string and numberStr:456
NSLog(@"model: %@",model);
// model JSValue: TestModel With testString:test string and numberStr:456
NSLog(@"model JSValue: %@",modelValue);
```

如果想要上述 JS 修改起作用,则需要实现 JSExport 协议。
通过实现该协议来暴露自定义类给 JS，这样 JS 会为这个类创建一个 wrapper object，这样看起来就像 OC 和 JS 在互相传值一样。这样，一个对象可以在 JS 和 OC 间共享，任何一端的更改都将同步到另外一端。需要注意的是，JS 只能修改暴露在协议中的属性或调用协议中的方法。

```ObjectiveC
// .h
@protocol TestModelDelegate <JSExport>

@property (nonatomic, copy) NSString *testString;
- (void)modelTest;

@end

@interface TestModel : NSObject <TestModelDelegate>

@property (nonatomic, copy) NSString *testString;
@property (nonatomic, copy) NSString *numberStr;

@end

// .m

- (NSString *)description
{
    NSString *str = [@"TestModel With testString:" stringByAppendingString:self.testString];
    return [str stringByAppendingString:[NSString stringWithFormat:@" and numberStr:%@",self.numberStr]];
}

- (void)modelTest
{
    NSLog(@"modelTest!!!");
}

- (void)test
{
    NSLog(@"Test!!!");
}

// viewDidLoad
[context evaluateScript:@"model.testString = \"anotoher test\";model.numberStr = \"567\""];
// model: TestModel With testString:anotoher test and numberStr:123
NSLog(@"model: %@",model);
// model JSValue: TestModel With testString:anotoher test and numberStr:123
NSLog(@"model JSValue: %@",modelValue);
// modelTest!!!
[context evaluateScript:@"model.modelTest()"];
JSValue *unknowValue = [context evaluateScript:@"model.test()"];
// unknowValue :undefined
NSLog(@"unknowValue :%@",unknowValue);
```
上例中的 numberStr 之所以还是保持为 123 是因为，这个属性不在协议中，JS 对其修改不起作用，同样如果 JS 中调用 model 不在协议中的方法，也不起作用，如果用 JSValue 去接收这个值，其值为 undefined。
没有任何响应，如果用一个 JSValue 去接收上面代码的值，得到的是 undifine

##### 对象对应关系

   Objective-C type  |   JavaScript type
 --------------------|---------------------
         nil         |     undefined
        NSNull       |        null
       NSString      |       string
       NSNumber      |   number, boolean
     NSDictionary    |   Object object
       NSArray       |    Array object
        NSDate       |     Date object
       NSBlock       |   Function object 
          id         |   Wrapper object 
        Class        | Constructor object

#### UIWebView 与 JavaScriptCore 的交互
UIWebview 也有一个 JSContext 实例，但是没有暴露在 API 中，但是我们可以通过 KVC 或者在 NSObject 分类去拿到这个实例，然后来进行自定义的一些操作。关于 NSObject 分类实现可以参考[这里](http://stackoverflow.com/questions/18920536/why-use-javascriptcore-in-ios7-if-it-cant-access-a-uiwebviews-runtime)。但是这两种方法都有可能被拒。

其实WebView 与 JS 的交互和上述的 TestModel 与 JS 交互区别不大。只不过上例都是自己创建的 context，而在webView 中则是我们通过 KVC 来拿到这个 context 而不是自己创建。来看一个例子：

```html
<!DOCTYPE html>
<html>
    <head>
        <script>
            function test()
            {
                objcObject.testDemo();
                alert(objcObject);
            }
        </script>
    </head>
    <body>
        <h1>JavaScriptCore Demo</h1>
        <button type="button" onclick="test()">测试</button>
    </body>
</html>
```
上述 html 简单创建了一个 button，然后绑定一个事件。
接下来看看 ViewController 里面做了什么。

```ObjectiveC
// .h
@protocol TestJSDelegate <JSExport>

- (void)testDemo;

@end

@interface WebViewController : UIViewController <TestJSDelegate,UIWebViewDelegate>

@end

// .m
- (void)viewDidLoad
{
    [super viewDidLoad];
    NSURL *path = [[NSBundle mainBundle] URLForResource:@"test" withExtension:@"html"];
    NSString *html = [NSString stringWithContentsOfURL:path encoding:NSUTF8StringEncoding error:nil];
    [self.webView loadHTMLString:html baseURL:nil];
}
- (void)webViewDidFinishLoad:(UIWebView *)webView
{
	JSContext *context = [webView valueForKeyPath:@"documentView.webView.mainFrame.javaScriptContext"];
    context[@"objcObject"] = self;
}

- (void)testDemo
{
    NSLog(@"test!!!");
}
```

运行效果:

![](http://img.cdn.punmy.cn/2019-11-21-15743467085275.jpg!wm)
![](http://img.cdn.punmy.cn/2019-11-21-15743467192938.jpg!wm)

如果协议方法中有多个参数该怎么调用呢？举个例子

```ObjectiveC
// ObjC 中的某个协议方法
- (void)testWithName:(NSString *)name age:(NSNumber *)age
{
    NSLog(@"name:%@,age:%@",name,age);
}
```

```Html
// 在上述 html 的 js 中添加一行代码
objcObject.testWithNameAge("Tracy",20);
```
那么在按钮点击后，协议方法将会被执行，然后打印出 `name:Tracy,age:20`。

#### 内存管理

OC 中是用的是 ARC，JavaScriptCore 中用的是垃圾回收机制（garbage collection）,JavaScriptCore 中所有引用都为强引用。在大部分情况下，JavaScriptCore 能做到在这两种内存管理机制之间无缝切换，但是在以下两种情况下需要特别注意：

- 在 OC 对象中存储 JavaScript 值
- 在 OC 对象中添加 JavaScript 域

如下例就会造成循环引用：

```JavaScript
// ClickHandler 构造器，button 为 OC 对象，callback 是按钮点击事件回调
function ClickHandler(button, callback) {     this.button = button;     this.button.onClickHandler = this;     this.handleEvent = callback;};
```

```ObjectiveC
@implementation MyButton- (void)setOnClickHandler:(JSValue *)handler{     _onClickHandler = handler; // Retain cycle}@end
```
上例中 ClickHandler 对 button 进行了强引用，而 MyButton 中又对 _onClickHandler 这个 JSValue 进行了强引用，最终导致循环引用，如下图所示：

![](http://img.cdn.punmy.cn/2019-11-21-15743467542111.jpg!wm)

如果将 _onClickHandler 设置为 weak，那么我们将收不到点击事件回调。

举个栗子，在某个方法中有一个临时的 OC 对象，然后通过 JSContext 被 JS 中的变量引用，但是该 OC 方法调用结束后，这个临时对象将被释放，因此 JS 会造成错误访问。
 
同样的，如果用 JSContext 创建了对象，然后在 OC 中用 JSValue 去接收，即使把 JSValue 变量在 OC 中被 retain，但可能因为 JS 中因为变量没有了引用而被释放内存，那么对应的JSValue也没有用了。

所以苹果引入了另一个类来解决这种循环引用的问题。

```ObjectiveC
@implementation MyButton- (void)setOnClickHandler:(JSValue *)handler{
	//正确的姿势     _onClickHandler = [JSManagedValue managedValueWithValue:handler];     [_context.virtualMachine addManagedReference:_onClickHandler                                        withOwner:self]} 
@end
```
`addManagedReference`做的事情主要如下：它创建了一个 garbage collected reference，这种引用既不是强引用也不是弱引用。

![](http://img.cdn.punmy.cn/2019-11-21-15743467654320.jpg!wm)

JSManagedValue 本身是一个对 JavaScript Value 的弱引用，而 JSValue 是强引用。addManagedReference 将 JSManagedValue 转换为 garbage collected reference。如果 JS 在垃圾回收过程中能够找到 managed reference 的所有者，那么这个引用将不会被释放，否则将被释放。JSManagedValue 需要调用其addManagedReference:withOwner: 方法把它添加到JSVirtualMachine 中，确保使用过程中 JSValue 不会被释放。

#### 多线程

如前面所说，每一个 JSVirtualMachine 都可以有多个 JScontext，在每个进程中又可以有多个  JSVirtualMachine。JSValue 可以在同一个 JSVirtualMachine 中的不同  JSContext 之间传递，但是不能跨 JSVirtualMachine 来传递。因为每个 JSVirtualMachine 都有自己的内存堆以及垃圾回收器，如果  JSValue 跨 JSVirtualMachine 传递，那么垃圾回收器将不知如何处理来自不同内存堆的 JSvalue。

- JavaScriptCore 的 API 是线程安全的
- 同步锁粒度：JSVirtualMachine，即我们可以在 JSVirtualMachine 不同线程中调用 JS，但是如果有线程正在执行 JS，那么其它线程将不能执行 JS 操作。所以要想进行并发操作，那么需要为每个操作创建一个单独的 JSVirtualMachine 来实现并发。

### WKWebView (iOS8 and later)
#### 新特性


- 在性能、稳定性、功能方面有很大提升（最直观的体现就是加载网页是占用的内存）；
- 允许JavaScript的Nitro库加载并使用（UIWebView中限制）；
- 支持了更多的HTML5特性以及 native 和 web 的高效交互；
- 高达60fps的滚动刷新率以及内置手势；
- 将UIWebViewDelegate与UIWebView重构成了14类与3个协议

WebKit 为非线程安全的，所以要确保该 framework 的所有方法在主线程上调用。

更多内容请参考[Nshipster](http://nshipster.cn/wkwebkit/)。

### 总结

总得来说两种方式都可以实现二者的交互，JavaScriptBridge 相对而言复杂一些，但是安全且不需要做版本适配，APP 上架不会被拒，但是 JavaScriptCore 更加简洁，不需要写繁琐的代码，但是有被拒的风险，同时这个框架是在 iOS7 之后才有，所以如果要适配 iOS6的话还是选择 JavaScriptBridge。

本文 [Demo](https://github.com/wang9262/WebViewJSDemo)