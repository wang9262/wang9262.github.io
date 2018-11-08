---
title: 使用 Travis CI 实现 Hexo 博客自动部署
date: 2018-10-28 23:18:46
tags: [笔记,原创]
category: 备忘记录
---

现在使用的博客系统是 Hexo+GitHub Pages，每次发布新的文章时流程甚是繁琐，是否有好的方式来提高效率，专注于【写】这件事上呢？

<!-- more -->

之前从 Jeklly 转到 Hexo，发现 Hexo 比较符合我的习惯，但是每次写一篇新文章要发布，流程有点麻烦，具体我们可以来看看。在流程介绍前，先说一下我的写作环境。

> Markdown 编辑器：MWeb
> 博客系统：Hexo

至于如何搭建基于 Hexo + GitHub Pages，这里就不说了，网上教程一大堆，而 MWeb 的一些基本使用以及进阶使用，在其官网上作者已经给了充分的介绍，这里也不再赘述，在我们只关心如何优化现有流程。好了，废话说完我们看下现有流程，以及我们期望的流程。

## 现有流程

* 用 `hexo n "some title"` 生成一个 `markdown` 文件
* MWeb 写文章，可能还要插入图片
* 上传图片到图床，替换 markdown 中的本地图片路径为图床链接
* `hexo g`、`hexo s` 确认无误后，`hexo d`

> 这里要推荐一波 MWeb，他可以真正让你专注于写作，如果需要插入图片，只需要截图后粘贴，或复制后粘贴，或直接把图片拖到编辑窗口中即可。
> 得益于 MWeb 外部文档的概念，我们只需要把 Hexo 的 source 文件加添加到 MWeb 当中，然后进行简单的配置即可，如下图所示
> ![](http://img.cdn.punmy.cn/15408215810799.jpg)

现有流程有哪些麻烦的地方呢？需要本地安装 Hexo，每次换电脑都要重新安装，有时候因为国内这尿性，Hexo 根本就安装不下来，也是很无奈。然后每次还得 `hexo g/s/d`，让写作欲大大降低。

## 期望的流程

* 直接使用 MWeb 生成 md 文件
* 图片加水印
* 写完之后，推送到 GitHub，自动生成博客

## 动手实现

第一个就不多说了，直接说下图片加水印。

### 图片加水印

上面说到 MWeb 会帮我们自动上传文章引用的图片到图床，前提是我们配置了图床。我这里使用的是七牛作为图床。先来看下我的七牛相关配置以及 MWeb 中关于七牛的配置。

由于[七牛测试域名已经无法再使用](https://developer.qiniu.com/fusion/kb/1319/test-domain-access-restriction-rules)，所以必须要绑定一个域名，而且该域名需要备案过。

![](http://img.cdn.punmy.cn/15408224031789.jpg)
![](http://img.cdn.punmy.cn/15408228089469.jpg)

> 关于上面的第五点，图片处理样式的别名，七牛上我配置的是 `wm`，样式分割线我设置的是 `!`，所以 MWeb 里面我填的是 `!wm`，你只需要按照你自己的样式去弄即可。最后 MWeb 给的链接类似 `http://sub.your.domain/xxxx.jpg!wm` 这样的。

其中如何绑定域名，七牛上都有对应的[开发文档](https://support.qiniu.com/hc/kb/article/68977/)，对着弄就行。

到这一步，我们实现了图片加水印，当然这是七牛提供的在线服务。**这里关键点是，你需要一个备案过的域名。**

### 自动生成博客

一篇文章写完后我们就需要把它发布到博客上，这里不再采取 `hexo g/s/d` 的方式，而是使用 `Travis CI` 来帮我们做自动部署，我们只需要关心文章的推送，而不关心博客的生成，生成直接交给 `Travis CI`。

相信你已经有了名为 `xxx.github.io` 的 repo，然后博客应该是放在 `master` 分支上的。把远端 repo 拉到本地，然后新建一个分支，分支名随意，假设为 `hexo`，删除所有内容，然后把 Hexo 生成的整个文件夹内容移到这个文件夹中，包括 theme 文件夹，这里需要注意的是如果子文件夹中包含 `.git` 文件，你需要删除，或者使用 submodule 的形式，我这里采用的是删除的方式。

#### 生成 Personal access tokens

![](http://img.cdn.punmy.cn/15408253054127.jpg!wm)

按照图中步骤生成 Token，这一步在后面要用到，生成之后最好复制一下，以免关掉页面后，就看不到只能重新生成了。

#### Travis CI 配置

首先我们用 GitHub 登录上 [`Travis CI`](https://travis-ci.org)，然后找到你想要开启的 Repo，然后将其开关打开，做如下图配置即可。

![](http://img.cdn.punmy.cn/15408248530555.jpg!wm)

紧接着我们在电脑上需要使用命令 `sudo gem install travis` 安装 `travis`，然后在 hexo 文件夹下创建一个 `.travis.yml`。下面是我的整个安装记录步骤及日志，关键点我都加了注释：

<details>
<summary>👈点击安装步骤日志</summary>

```shell
# 当前在 hexo 根目录下，且 .travis.yml 文件已在根目录下创建好了
$ sudo gem install travis    
Password:
Fetching: backports-3.11.4.gem (100%)
Successfully installed backports-3.11.4
Fetching: addressable-2.4.0.gem (100%)
Successfully installed addressable-2.4.0
... # 中间一堆日志省略了

$ travis login           # 使用 GitHub 登录，下面是日志不用管                                                                                                                                  
We need your GitHub login to identify you.
This information will not be sent to Travis CI, only to api.github.com.
The password will not be displayed.

Try running with --github-token or --auto if you don't want to enter your password anyway.

Username: wang9262     # 输入 GitHub 用户名
Password for wang9262: **************  # 输入 GitHub 密码
Successfully logged in as wang9262!

travis encrypt ENVName=yourtoken --add   #  ENVName 可以换成任意字符串，yourtoken 换成上面生成的 token，比如我的是 BlogToken=12345
```

</details>

以上操作执行完，打开 `.travis.yml`，会发现已经生成了一些类似下面代码

```ruby
env:
  global:
    - secure: wrewrewrwebJ+XFbrUGTM0kIr.....
```

然后 `.travis.yml` 具体内容，可以参考我这个[分支](https://github.com/wang9262/wang9262.github.io/blob/hexo/.travis.yml)上的内容即可。其中上面那个[脚本](https://github.com/wang9262/wang9262.github.io/blob/hexo/commit-message.sh)需要说明的是为了给每次 `commit` 时添加记录用的，同时为了防止之前的记录被覆盖，需要先将远端的 `.git` 拷贝到本地，然后再进行 `commit`，这样可以保证所有历史记录都在，这个脚本也是放在根目录下的。

> 我用的命令行方式，如果用的不是命令行方式，可以参考网上的，在网页上设置环境变量，把 Token 填入到网页上，也就是上图中的2、3两个标记点，2填入环境变量名，3处填入 Token，也可以新增其它环境变量。

## 最后

现在每次有新文章发布，只需要本地写好后，把 markdown 文件推到远端的 `hexo` 分支即可，不需要额外操作，这样可以便捷地在多台电脑上发布内容，不必为环境配置而担心。当然这篇文章也是通过这种方式发布的，效果还行吧。

![](http://img.cdn.punmy.cn/15408284851484.jpg!wm)

接下来的计划就是把文章顶部的一些 hexo 用到的元信息通过脚本自动生成而不需要手动去添加。

如果你根据上面步骤，没有达到想要的效果，可以在下方留言，一起交流沟通。当然如果你有更高效的方式，也欢迎分享一下~






