import{a as te}from"./chunk-HDBGLD52.js";import{a as Z}from"./chunk-HKBOYPO3.js";import{a as ee,c as ne,d as se}from"./chunk-BM7DUPOK.js";import"./chunk-R7WH3GYF.js";import"./chunk-JCJIXIGU.js";import{a as X}from"./chunk-PAWPQVJP.js";import{f as w}from"./chunk-2PMUV4MH.js";import"./chunk-OJYR24EB.js";import"./chunk-A3A72ILT.js";import{a as Q}from"./chunk-TVMSW2JO.js";import"./chunk-CUKNIT7M.js";import{a as q}from"./chunk-AY56TXUB.js";import{j as J,v as K}from"./chunk-VMH4ILIM.js";import"./chunk-6AWQUBPH.js";import"./chunk-HZKDOO2A.js";import"./chunk-JLIX64RS.js";import{c as O}from"./chunk-VORQTW3B.js";import"./chunk-FVBRAVME.js";import"./chunk-L2D7AHNW.js";import"./chunk-POHCU53O.js";import{a as G}from"./chunk-6QI4QBU5.js";import"./chunk-DXFFT4B6.js";import"./chunk-UJ255QIO.js";import"./chunk-MXV4M2BO.js";import"./chunk-4N6BO7AP.js";import"./chunk-RU375CWH.js";import"./chunk-KXJUWRJT.js";import"./chunk-SB5MWYDA.js";import{a as H}from"./chunk-EMZRNCIP.js";import{a as v,c as z}from"./chunk-DKHW3YWA.js";import{r as Y,t as R}from"./chunk-2T5SWUVG.js";import{B as C,Cb as c,D as $,Db as g,Eb as A,I as D,Ib as x,J as B,Nb as S,Pb as l,T as s,Wa as h,Xa as f,Z as V,ca as E,f as T,g as F,gc as N,ha as L,mb as P,mc as U,nc as M,p as I,qa as d,ra as p,rb as _,xb as y,zc as W}from"./chunk-NSU275EB.js";import{a as j,b as k,g as ie}from"./chunk-ODN5LVDJ.js";ne();var $e=ie(se());var re=(()=>{class a{http;baseUrl=H.apiUrl;constructor(e){this.http=e}getPrograms(){return this.http.get(`${this.baseUrl}/programs`)}addProgram(e){return this.http.post(`${this.baseUrl}/addProgram`,e,{headers:new v({"Content-Type":"application/json"})})}updateProgram(e,t){let r=`${this.baseUrl}/updateProgram/${e}`;return this.http.put(r,t,{headers:new v({"Content-Type":"application/json"})})}deleteProgram(e){let t=`${this.baseUrl}/deleteProgram/${e}`;return this.http.delete(t)}static \u0275fac=function(t){return new(t||a)(E(z))};static \u0275prov=V({token:a,factory:a.\u0275fac,providedIn:"root"})}return a})();function de(a,b){a&1&&(c(0,"div",1),A(1,"app-loading"),g())}function pe(a,b){if(a&1){let e=x();c(0,"app-table-generic",6),S("edit",function(r){d(e);let o=l(2);return p(o.openEditProgramDialog(r))})("delete",function(r){d(e);let o=l(2);return p(o.deleteProgram(r))}),g()}if(a&2){let e=l(2);_("columns",e.columns)("data",b)("tableName","programs")("displayedColumns",e.displayedColumns)}}function ce(a,b){if(a&1){let e=x();c(0,"div",2)(1,"app-table-header",3),S("inputChange",function(r){d(e);let o=l();return p(o.onInputChange(r))})("add",function(){d(e);let r=l();return p(r.openAddProgramDialog())})("export",function(){d(e);let r=l();return p(r.onExport())}),g()(),c(2,"div",4),P(3,pe,1,4,"app-table-generic",5),U(4,"async"),g()}if(a&2){let e,t=l();_("@fadeAnimation",void 0),h(),_("inputFields",t.headerInputFields)("addButtonLabel","Add Program"),h(),_("@fadeAnimation",void 0),h(),y((e=M(4,5,t.programs$))?3:-1,e)}}var De=(()=>{class a{cdr;dialog;snackBar;programService;programStatuses=["Active","Inactive"];programYears=[1,2,3,4,5];isLoading=!0;destroy$=new T;allPrograms=[];programsSubject=new F([]);programs$=this.programsSubject.asObservable();columns=[{key:"index",label:"#"},{key:"program_code",label:"Program Code"},{key:"program_title",label:"Program Title"},{key:"program_info",label:"Program Info"},{key:"status",label:"Status"},{key:"number_of_years",label:"Years"},{key:"curriculum_years",label:"Curriculum Year"}];displayedColumns=["index","program_code","program_title","program_info","status","number_of_years","curriculum_years"];headerInputFields=[{type:"text",label:"Search Programs",key:"search"}];searchControl=new J("");constructor(e,t,r,o){this.cdr=e,this.dialog=t,this.snackBar=r,this.programService=o}ngOnInit(){this.fetchPrograms(),this.setupSearch()}ngOnDestroy(){this.destroy$.next(),this.destroy$.complete()}fetchPrograms(){this.isLoading=!0,this.programService.getPrograms().pipe(I(e=>this.formatPrograms(e)),C(e=>(this.snackBar.open("Failed to load programs.","Close",{duration:3e3}),[])),B(()=>{this.isLoading=!1,this.cdr.markForCheck()}),s(this.destroy$)).subscribe(e=>{this.allPrograms=e,this.programsSubject.next(this.allPrograms)})}setupSearch(){this.searchControl.valueChanges.pipe($(300),D(),s(this.destroy$)).subscribe(e=>{let t=e?e.trim().toLowerCase():"";if(t){let r=this.allPrograms.filter(o=>o.program_title.toLowerCase().includes(t)||o.program_code.toLowerCase().includes(t));this.programsSubject.next(r)}else this.programsSubject.next(this.allPrograms)})}formatPrograms(e){return e.map(t=>k(j({},t),{curriculum_years:t.curricula.map(r=>r.curriculum_year).join(", ")}))}onInputChange(e){e.search!==void 0&&this.searchControl.setValue(e.search)}getDialogConfig(e){return{title:e?"Edit Program":"Add Program",isEdit:!!e,fields:[{label:"Program Code",formControlName:"program_code",type:"text",maxLength:15,required:!0},{label:"Program Title",formControlName:"program_title",type:"text",maxLength:100,required:!0},{label:"Program Info",formControlName:"program_info",type:"text",maxLength:255,required:!0},{label:"Program Status",formControlName:"status",type:"select",options:this.programStatuses,required:!0},{label:"Years",formControlName:"number_of_years",type:"select",options:this.programYears,required:!0}],initialValue:e||{status:"Active",number_of_years:4}}}openAddProgramDialog(){let e=this.getDialogConfig();this.dialog.open(w,{data:e,disableClose:!0}).afterClosed().pipe(s(this.destroy$)).subscribe(r=>{if(r){let o=r;this.programService.addProgram(o).pipe(s(this.destroy$),C(m=>(this.snackBar.open("Failed to add program.","Close",{duration:3e3}),[]))).subscribe(m=>{let i=this.formatPrograms([m])[0],u=this.programsSubject.getValue();this.programsSubject.next([...u,i]),this.snackBar.open(`Program ${m.program_code} has been added successfully.`,"Close",{duration:3e3})})}})}openEditProgramDialog(e){let t=this.getDialogConfig(e);this.dialog.open(w,{data:t,disableClose:!0}).afterClosed().pipe(s(this.destroy$)).subscribe(o=>{o&&this.updateProgram(o,e.program_id)})}updateProgram(e,t){this.programService.updateProgram(t,e).pipe(s(this.destroy$),C(r=>(this.snackBar.open("Failed to update program.","Close",{duration:3e3}),[]))).subscribe(r=>{let o=this.formatPrograms([r])[0],i=this.programsSubject.getValue().map(u=>u.program_id===t?o:u);this.programsSubject.next(i),this.snackBar.open(`Program ${r.program_code} has been updated successfully.`,"Close",{duration:3e3})})}deleteProgram(e){this.programService.deleteProgram(e.program_id).pipe(s(this.destroy$)).subscribe(t=>{if(t.success){let o=this.programsSubject.getValue().filter(m=>m.program_id!==e.program_id);this.programsSubject.next(o),this.snackBar.open(`Program "${e.program_title}" has been deleted successfully.`,"Close",{duration:3e3})}else this.snackBar.open(t.message,"Close",{duration:3e3})},t=>{this.snackBar.open("Failed to delete program due to a server error.","Close",{duration:3e3})})}createPdfBlob(){let e=new ee("p","mm","legal"),t=e.internal.pageSize.width,r=10,o=22,i=15;e.addImage("https://iantuquib.weebly.com/uploads/5/9/7/7/59776029/2881282_orig.png","PNG",r,10,o,o),e.setFontSize(12),e.setFont("times","bold"),e.text("POLYTECHNIC UNIVERSITY OF THE PHILIPPINES \u2013 TAGUIG BRANCH",t/2,i,{align:"center"}),i+=5,e.setFontSize(12),e.text("Gen. Santos Ave. Upper Bicutan, Taguig City",t/2,i,{align:"center"}),i+=10,e.setFontSize(15),e.text("Program Report",t/2,i,{align:"center"}),i+=8,e.setDrawColor(0,0,0),e.setLineWidth(.5),e.line(r,i,t-r,i),i+=7;let oe=this.programsSubject.getValue().map((n,ae)=>[(ae+1).toString(),n.program_code,n.program_title,n.program_info,n.status,n.number_of_years.toString(),n.curriculum_years]);return e.autoTable({startY:i,head:[["#","Program Code","Program Title","Program Info","Status","Years","Curriculum Year"]],body:oe,theme:"grid",headStyles:{fillColor:[128,0,0],textColor:[255,255,255],fontSize:9},bodyStyles:{fontSize:8,textColor:[0,0,0]},styles:{lineWidth:.1,overflow:"linebreak",cellPadding:2},columnStyles:{0:{cellWidth:10},1:{cellWidth:30},2:{cellWidth:40},3:{cellWidth:45},4:{cellWidth:20},5:{cellWidth:15},6:{cellWidth:30}},margin:{left:r,right:r},didDrawPage:n=>{i=n.cursor.y+10}}),e.output("blob")}onExport(){this.dialog.open(Z,{maxWidth:"70rem",width:"100%",data:{exportType:"all",entity:"Programs",customTitle:"Export All Programs",generatePdfFunction:e=>this.createPdfBlob(),generateFileNameFunction:()=>"pup_taguig_programs_offered.pdf"}})}static \u0275fac=function(t){return new(t||a)(f(W),f(O),f(Q),f(re))};static \u0275cmp=L({type:a,selectors:[["app-programs"]],standalone:!0,features:[N],decls:3,vars:1,consts:[[1,"programs-container"],[1,"loading-wrapper"],[1,"programs-header-container"],[3,"inputChange","add","export","inputFields","addButtonLabel"],[1,"programs-table-container"],[3,"columns","data","tableName","displayedColumns"],[3,"edit","delete","columns","data","tableName","displayedColumns"]],template:function(t,r){t&1&&(c(0,"div",0),P(1,de,2,0,"div",1)(2,ce,5,7),g()),t&2&&(h(),y(r.isLoading?1:2))},dependencies:[R,Y,K,te,X,q],styles:[".programs-container[_ngcontent-%COMP%]{transition:background-color .3s ease;display:flex;flex-direction:column;gap:var(--spacing-xs);height:100%}.programs-table-container[_ngcontent-%COMP%]{display:flex;flex-direction:column;align-items:none;justify-content:none;gap:0;-ms-overflow-style:none;scrollbar-width:none;flex:1;overflow:auto;position:relative;border-radius:var(--border-radius-md)}.programs-table-container[_ngcontent-%COMP%]::-webkit-scrollbar{display:none}"],data:{animation:[G]},changeDetection:0})}return a})();export{De as ProgramsComponent};
