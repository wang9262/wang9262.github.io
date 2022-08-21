// A local search script with the help of [hexo-generator-search](https://github.com/PaicHyperionDev/hexo-generator-search)
// Copyright (C) 2017
// Liam Huang <http://github.com/Liam0205>
// This library is free software; you can redistribute it and/or modify
// it under the terms of the GNU Lesser General Public License as
// published by the Free Software Foundation; either version 2.1 of the
// License, or (at your option) any later version.
//
// This library is distributed in the hope that it will be useful, but
// WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
// Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public
// License along with this library; if not, write to the Free Software
// Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA
// 02110-1301 USA
//

document.addEventListener("DOMContentLoaded", () => {
    const search_input = document.querySelector(".search-input"),
    reset = () => {
        document.body.classList.remove("search-active")
    }
    document.querySelector(".search-popup-trigger").onclick = function(){
        document.body.classList.add("search-active")
        setTimeout(() => search_input.focus(), 500)
        getSearchFile()
    }

    document.querySelector(".popup-btn-close").onclick = function() {
        reset();
    }

    window.addEventListener("keyup", e => {
        "Escape" === e.key && reset();
    })
    document.querySelector(".search-pop-overlay").addEventListener("click", e => {
        e.target === document.querySelector(".search-pop-overlay") && reset();
    })
})

var searchFunc = function(path, search_id, content_id) {
    'use strict';

$.ajax({
        url: path,
        dataType: "xml",
        success: function( xmlResponse ) {
            // get the contents from search data
            var datas = $( "entry", xmlResponse ).map(function() {
                return {
                    title: $( "title", this ).text(),
                    content: $("content",this).text(),
                    url: $( "url" , this).text()
                };
            }).get().reverse();

            var $input = document.querySelector(search_id);
            if (!$input) return;
            var $resultContent = document.querySelector(content_id);
            if ($("#local-search-input").length > 0) {
                $input.addEventListener('input', function () {
                    var str = '<ul class=\"search-result-list\">';
                    var keywords = this.value.trim().split(/[\s\-]+/);
                    $resultContent.innerHTML = "";
                    if (this.value.trim().length <= 0) {
                        return;
                    }
                    var matchedCount = 0;
                    // perform local searching
                    datas.forEach(function (data) {
                        var isMatch = true;
                        if (!data.title || data.title.trim() === '') {
                            data.title = "Untitled";
                        }
                        var data_title = data.title.trim();
                        var data_content = data.content.trim().replace(/<[^>]+>/g, "");
                        var data_url = data.url;
                        var index_title = -1;
                        var index_content = -1;
                        var first_occur = -1;
                        // only match articles with not empty contents
                        if (data_content !== '') {
                            keywords.forEach(function (keyword, i) {
                                index_title = data_title.indexOf(keyword);
                                index_content = data_content.indexOf(keyword);

                                if (index_title < 0 && index_content < 0) {
                                    isMatch = false;
                                } else {
                                    if (index_content < 0) {
                                        index_content = 0;
                                    }
                                    if (i == 0) {
                                        first_occur = index_content;
                                    }
                                }
                            });
                        } else {
                            isMatch = false;
                        }
                        // show search results
                        if (isMatch) {
                            matchedCount += 1;
                            str += "<li><a href='" + data_url + "' class='search-result-title'>" + data_title;
                            var content = data.content.trim().replace(/<[^>]+>/g, "");
                            if (first_occur >= 0) {
                                // cut out 100 characters
                                var start = first_occur - 60;
                                var end = first_occur + 120;

                                if (start < 0) {
                                    start = 0;
                                }

                                if (start == 0) {
                                    end = 180;
                                }

                                if (end > content.length) {
                                    end = content.length;
                                }

                                var match_content = content.substring(start, end);

                                // highlight all keywords
                                keywords.forEach(function (keyword) {
                                    var regS = new RegExp(keyword, "gi");
                                    match_content = match_content.replace(regS, "<em class=\"search-keyword\">" + keyword + "</em>");
                                });

                                str += "<p class=\"search-result\">" + match_content + "...</p></a>"
                            }
                            str += "</li>";
                        }
                    });
                    str += "</ul>";
                    var countDiv = "<div class=\"search-result-count\">"
                    if (matchedCount > 0) {
                        countDiv += "共 " + matchedCount + " 个结果</div> <hr>"
                    } else {
                        countDiv += "暂时没有搜索到你想要的内容，换个关键词看看~</div> <hr>"
                    }
                    $resultContent.innerHTML = countDiv + str;
                });
            }
        }
    });
}

var getSearchFile = function(){
    var path = "/search.xml";
    searchFunc(path, '.search-input', '.search-result-container');
}
