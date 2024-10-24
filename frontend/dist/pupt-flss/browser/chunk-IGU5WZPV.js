import{a as F}from"./chunk-2XPO3A3X.js";import"./chunk-R7WH3GYF.js";import{a as B}from"./chunk-MVPRFZGE.js";import{a as T}from"./chunk-M774G3SU.js";import{e as _}from"./chunk-UI373YL4.js";import"./chunk-OJYR24EB.js";import{a as P}from"./chunk-TVMSW2JO.js";import"./chunk-Y7FYPZNW.js";import"./chunk-A3A72ILT.js";import"./chunk-CUKNIT7M.js";import{a as I}from"./chunk-AY56TXUB.js";import"./chunk-6AWQUBPH.js";import{v as A}from"./chunk-VMH4ILIM.js";import"./chunk-XOQFDSMO.js";import"./chunk-JLIX64RS.js";import{c as V}from"./chunk-VORQTW3B.js";import"./chunk-FVBRAVME.js";import"./chunk-L2D7AHNW.js";import"./chunk-POHCU53O.js";import{a as L}from"./chunk-6QI4QBU5.js";import"./chunk-DXFFT4B6.js";import"./chunk-UJ255QIO.js";import"./chunk-MXV4M2BO.js";import"./chunk-4N6BO7AP.js";import{d as k}from"./chunk-RU375CWH.js";import"./chunk-KXJUWRJT.js";import"./chunk-SB5MWYDA.js";import"./chunk-EMZRNCIP.js";import"./chunk-DKHW3YWA.js";import{t as D}from"./chunk-2T5SWUVG.js";import{Cb as h,Db as C,Eb as x,Ib as E,Nb as f,Pb as c,T as m,Wa as d,Xa as l,f as y,gc as S,ha as b,mb as w,qa as s,ra as n,rb as p,xb as v,zc as M}from"./chunk-NSU275EB.js";import{a as g}from"./chunk-ODN5LVDJ.js";function $(o,N){o&1&&(h(0,"div",1),x(1,"app-loading"),C())}function j(o,N){if(o&1){let e=E();h(0,"div",2)(1,"app-table-header",3),f("inputChange",function(r){s(e);let t=c();return n(t.onInputChange(r))})("add",function(){s(e);let r=c();return n(r.openAddCurriculumDialog())}),C()(),h(2,"div",4)(3,"app-table-generic",5),f("view",function(r){s(e);let t=c();return n(t.onViewCurriculum(r))})("edit",function(r){s(e);let t=c();return n(t.openEditCurriculumDialog(r))})("delete",function(r){s(e);let t=c();return n(t.deleteCurriculum(r))}),C()()}if(o&2){let e=c();p("@fadeAnimation",void 0),d(),p("inputFields",e.headerInputFields)("addButtonLabel","Add Curriculum")("showExportButton",!1),d(),p("@fadeAnimation",void 0),d(),p("columns",e.columns)("data",e.curricula)("tableName","curriculum")("displayedColumns",e.displayedColumns)("showViewButton",!0)}}var ee=(()=>{class o{cdr;dialog;snackBar;curriculumService;router;destroy$=new y;curriculumStatuses=["Active","Inactive"];curricula=[];programs=[];availableCurriculumYears=[];isLoading=!0;columns=[{key:"index",label:"#"},{key:"curriculum_year",label:"Curriculum Year"},{key:"status",label:"Status"}];displayedColumns=["index","curriculum_year","status"];headerInputFields=[{type:"text",label:"Search Curriculum",key:"search"}];constructor(e,i,r,t,u){this.cdr=e,this.dialog=i,this.snackBar=r,this.curriculumService=t,this.router=u}ngOnInit(){this.fetchCurricula()}ngOnDestroy(){this.destroy$.next(),this.destroy$.complete()}fetchCurricula(){this.isLoading=!0,this.curriculumService.getCurricula().pipe(m(this.destroy$)).subscribe({next:e=>{this.updateCurriculaList(e),this.isLoading=!1},error:()=>{this.showErrorMessage("Error fetching curricula. Please try again."),this.isLoading=!1}})}onSearch(e){this.curriculumService.getCurricula().pipe(m(this.destroy$)).subscribe({next:i=>{this.curricula=i.filter(r=>r.curriculum_year.includes(e)||r.status.toLowerCase().includes(e.toLowerCase())),this.cdr.markForCheck()},error:()=>this.showErrorMessage("Error performing search. Please try again.")})}onInputChange(e){e.search!==void 0&&this.onSearch(e.search)}onViewCurriculum(e){this.router.navigate(["/superadmin/curriculum",e.curriculum_year])}addCurriculum(e){let i={curriculum_year:e.curriculum_year,status:e.status};this.curriculumService.addCurriculum(i).subscribe({next:r=>{this.showSuccessMessage(r.message),this.fetchCurricula()},error:r=>{r.error?.message?.includes("already exists")?this.showErrorMessage(`${e.curriculum_year} Curriculum already exists.`):this.showErrorMessage("Error adding curriculum. Please try again.")}})}updateCurriculum(e){let i={curriculum_year:e.curriculum_year,status:e.status};this.curriculumService.updateCurriculum(e.curriculum_id,i).subscribe({next:r=>{this.showSuccessMessage(r.message),this.fetchCurricula()},error:()=>this.showErrorMessage("Error updating curriculum. Please try again.")})}deleteCurriculum(e){this.curriculumService.deleteCurriculum(e.curriculum_year).subscribe({next:i=>{i.status==="fail"?this.showErrorMessage(i.message):(this.showSuccessMessage(i.message),this.curricula=this.curricula.filter(r=>r.curriculum_id!==e.curriculum_id),this.updateCurriculaList(this.curricula))},error:i=>{this.showErrorMessage("Error during the deletion process. Please try again."),console.error("Error:",i)}})}openAddCurriculumDialog(){this.curriculumService.getAllPrograms().pipe(m(this.destroy$)).subscribe({next:e=>{let i=e.filter(r=>r.status==="Active");if(!e||e.length===0||i.length===0){this.showErrorMessage("No programs found. Add at least one active program to create a curriculum.");return}this.curriculumService.getCurricula().pipe(m(this.destroy$)).subscribe({next:r=>{let t=this.getDialogConfig(r);this.dialog.open(_,{data:t,disableClose:!0}).afterClosed().subscribe(a=>{a&&(a.copy_from&&a.copy_from!=="None"?this.copyCurriculum(a):this.addCurriculum(a))})},error:()=>{this.showErrorMessage("Error fetching available curricula. Please try again.")}})},error:()=>{this.showErrorMessage("Error fetching programs. Please try again.")}})}openEditCurriculumDialog(e){this.openCurriculumDialog(e)}openCurriculumDialog(e){let i=e?this.curricula.filter(u=>u.curriculum_id!==e.curriculum_id):this.curricula,r=this.getDialogConfig(i,e);this.dialog.open(_,{data:r,disableClose:!0}).afterClosed().subscribe(u=>{u&&(r.isEdit?this.updateCurriculum(g(g({},e),u)):u.copy_from&&u.copy_from!=="None"?this.copyCurriculum(u):this.addCurriculum(u))})}copyCurriculum(e){let i=e.copy_from.split(" ")[0],r=e.curriculum_year,t=this.curricula.find(u=>u.curriculum_year===i);if(t&&t.curriculum_id){let u=t.curriculum_id;this.curriculumService.copyCurriculum(u,r).subscribe({next:()=>{this.showSuccessMessage("Curriculum copied successfully with new curriculum ID."),this.fetchCurricula()},error:a=>{this.showErrorMessage("Error copying curriculum. Please try again."),console.error("Error:",a)}})}else this.showErrorMessage("Error: Curriculum to copy from not found.")}getDialogConfig(e,i){let r=!!i;return{title:r?"Edit Curriculum":"Add Curriculum",isEdit:r,fields:[{label:"Curriculum Year",formControlName:"curriculum_year",type:"text",maxLength:4,required:!0},{label:"Status",formControlName:"status",type:"select",options:["Active","Inactive"],required:!0},...r?[]:[{label:"Copy from existing curriculum",formControlName:"copy_from",type:"select",options:["None",...e.map(t=>`${t.curriculum_year} Curriculum`)],required:!1}]],initialValue:r?{curriculum_year:i.curriculum_year,status:i.status}:{copy_from:"None",status:"Active"}}}updateCurriculaList(e){this.curricula=e,this.cdr.markForCheck()}showSuccessMessage(e){this.snackBar.open(e,"Close",{duration:3e3})}showErrorMessage(e){console.error(e),this.snackBar.open(e,"Close",{duration:3e3})}static \u0275fac=function(i){return new(i||o)(l(M),l(V),l(P),l(B),l(k))};static \u0275cmp=b({type:o,selectors:[["app-curriculum"]],standalone:!0,features:[S],decls:3,vars:1,consts:[[1,"curriculum-container"],[1,"loading-wrapper"],[1,"curriculum-header-container"],[3,"inputChange","add","inputFields","addButtonLabel","showExportButton"],[1,"curriculum-table-container"],[3,"view","edit","delete","columns","data","tableName","displayedColumns","showViewButton"]],template:function(i,r){i&1&&(h(0,"div",0),w(1,$,2,0,"div",1)(2,j,4,10),C()),i&2&&(d(),v(r.isLoading?1:2))},dependencies:[D,A,F,T,I],styles:[".curriculum-container[_ngcontent-%COMP%]{transition:background-color .3s ease;display:flex;flex-direction:column;gap:var(--spacing-xs);height:100%}.curriculum-table-container[_ngcontent-%COMP%]{display:flex;flex-direction:column;align-items:none;justify-content:none;gap:0;-ms-overflow-style:none;scrollbar-width:none;flex:1;overflow:auto;position:relative;border-radius:var(--border-radius-md)}.curriculum-table-container[_ngcontent-%COMP%]::-webkit-scrollbar{display:none}"],data:{animation:[L]},changeDetection:0})}return o})();export{ee as CurriculumComponent};
