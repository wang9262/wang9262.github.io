//
//  File.swift
//  
//
//  Created by Vong on 2022/4/14.
//
var weixinHeadButton = $('.headIconWeixin');
weixinHeadButton.hover(
    // in
    function(){
        $('.weixinHeadQcode').css('display','block');
    },
    // out
    function(){
        $('.weixinHeadQcode').css('display','none');
    }
)
