let e;const t=document.querySelector(".image-container"),n=document.querySelector(".components");function o(n){e=setInterval(()=>{t.scrollBy({top:10*n,behavior:"smooth"})},100)}function r(){clearInterval(e)}n.addEventListener("mousedown",e=>{let{clientY:t}=e,{top:r,bottom:c}=n.getBoundingClientRect();t<r+(c-r)/2?o(-1):o(1)}),n.addEventListener("mouseup",r),n.addEventListener("mouseleave",r);
//# sourceMappingURL=index.9e09cc79.js.map