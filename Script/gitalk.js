//
//  gittalk.js
//  
//
//  Created by Vong on 2022/4/10.
//

var articleID = document.title.split("|")[0]

var gitalk = new Gitalk({
    clientID: 'b56f11f2c9cf1bbc87ac',
    clientSecret: '98ade66fe9ef75f9f8c92cd0b6f002e0a1be2f8c',
    repo: 'Blog-Comments',
    owner: 'wang9262',
    admin: ['wang9262'],
    id: articleID.substring(0, Math.min(articleID.length-1, 49)),      // Ensure uniqueness and length less than 50
    distractionFreeMode: true,  // Facebook-like distraction free mode
    createIssueManually: true,
    language: navigator.userLanguage
});
gitalk.render('gitalk-container');
