import{a as P,b as h,d as w,e as I,f as O,g as S}from"./chunk-VORQTW3B.js";import{a as G,c as A}from"./chunk-L2D7AHNW.js";import{a as E,b as B}from"./chunk-DXFFT4B6.js";import{p as k,t as y}from"./chunk-2T5SWUVG.js";import{$b as x,Cb as c,Db as a,Eb as b,Ib as _,Nb as f,Pb as l,Wa as n,Xa as p,Zb as m,_b as C,gc as T,ha as v,jc as D,mb as s,qa as g,ra as u,rb as M,xb as d}from"./chunk-NSU275EB.js";var V=(o,r)=>({color:o,"background-color":r});function F(o,r){o&1&&b(0,"mat-progress-bar",3)}function R(o,r){if(o&1){let t=_();c(0,"button",7),f("click",function(){g(t);let e=l(2);return u(e.onNoClick())}),m(1),a()}if(o&2){let t=l(2);n(),x(" ",t.data.cancelText," ")}}function z(o,r){if(o&1){let t=_();c(0,"button",8),f("click",function(){g(t);let e=l(2);return u(e.onActionClick(e.data.action))}),m(1),a()}if(o&2){let t=l(2);M("ngStyle",D(2,V,t.data.actionTextColor,t.data.actionBgColor)),n(),x(" ",t.data.actionText," ")}}function j(o,r){if(o&1&&(c(0,"div",4),s(1,R,2,1,"button",5)(2,z,2,5,"button",6),a()),o&2){let t=l();n(),d(t.data.cancelText?1:-1),n(),d(t.data.actionText?2:-1)}}var Y=(()=>{class o{dialogRef;data;constructor(t,i){this.dialogRef=t,this.data=i}onNoClick(){this.dialogRef.close()}onActionClick(t){console.log("Action clicked:",t),this.dialogRef.close(t)}static \u0275fac=function(i){return new(i||o)(p(P),p(h))};static \u0275cmp=v({type:o,selectors:[["app-dialog-generic"]],standalone:!0,features:[T],decls:8,vars:4,consts:[[1,"mat-dialog-container"],["mat-dialog-title","",1,"custom-dialog-title"],["mat-dialog-content","",1,"custom-dialog-content","dialog-content"],["mode","indeterminate"],["mat-dialog-actions","",1,"custom-dialog-buttons"],["mat-button","",1,"dialog-cancel"],["mat-button","","cdkFocusInitial","",1,"dialog-action",3,"ngStyle"],["mat-button","",1,"dialog-cancel",3,"click"],["mat-button","","cdkFocusInitial","",1,"dialog-action",3,"click","ngStyle"]],template:function(i,e){i&1&&(c(0,"div",0)(1,"h1",1),m(2),a(),c(3,"div",2)(4,"p"),m(5),a(),s(6,F,1,0,"mat-progress-bar",3),a(),s(7,j,3,2,"div",4),a()),i&2&&(n(2),C(e.data.title),n(3),C(e.data.content),n(),d(e.data.showProgressBar?6:-1),n(),d(e.data.actionText||e.data.cancelText?7:-1))},dependencies:[y,k,S,w,O,I,A,G,B,E],styles:["[_nghost-%COMP%]   .mat-dialog-container[_ngcontent-%COMP%]{max-width:var(--dialog-base)}.custom-dialog-title[_ngcontent-%COMP%]{font-size:var(--font-size-xl);color:var(--primary-text);font-weight:500;font-family:Inter Tight,sans-serif}.custom-dialog-content[_ngcontent-%COMP%]{font-size:var(--font-size-md);margin:var(--spacing-md) 0}.custom-dialog-buttons[_ngcontent-%COMP%]{padding-bottom:var(--spacing-lg)}.custom-dialog-buttons.custom-dialog-buttons[_ngcontent-%COMP%]   .dialog-cancel[_ngcontent-%COMP%]{color:var(--primary-text)}.custom-dialog-buttons.custom-dialog-buttons[_ngcontent-%COMP%]   .dialog-action[_ngcontent-%COMP%]{background-color:var(--primary-one);color:#fff;font-weight:500}"]})}return o})();export{Y as a};
