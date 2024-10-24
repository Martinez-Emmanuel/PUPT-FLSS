import{a as z}from"./chunk-VE2RYDL7.js";import{a as Be,b as Ie}from"./chunk-PRIEC27T.js";import"./chunk-NME5OWLW.js";import{a as B,b as Ne}from"./chunk-R7WH3GYF.js";import{b as $,c as Ye,d as Oe}from"./chunk-BM7DUPOK.js";import"./chunk-JCJIXIGU.js";import{a as Ve}from"./chunk-M774G3SU.js";import"./chunk-UI373YL4.js";import{a as ye,b as Se,c as xe,d as be,e as we,f as Te,g as Fe,h as Ee,i as ve,j as De,k as Me,l as Re,m as Pe}from"./chunk-OJYR24EB.js";import{a as Le}from"./chunk-TVMSW2JO.js";import"./chunk-Y7FYPZNW.js";import"./chunk-A3A72ILT.js";import"./chunk-CUKNIT7M.js";import{a as _e}from"./chunk-OGNLWBT2.js";import{a as pe}from"./chunk-AY56TXUB.js";import{a as Ae,b as ke}from"./chunk-6AWQUBPH.js";import{g as fe,k as ge,u as Ce}from"./chunk-VMH4ILIM.js";import{a as le,b as re}from"./chunk-JLIX64RS.js";import{c as ce,g as de}from"./chunk-VORQTW3B.js";import"./chunk-FVBRAVME.js";import{a as ue,c as me}from"./chunk-L2D7AHNW.js";import"./chunk-POHCU53O.js";import{a as he}from"./chunk-6QI4QBU5.js";import"./chunk-DXFFT4B6.js";import{a as se}from"./chunk-UJ255QIO.js";import"./chunk-MXV4M2BO.js";import"./chunk-4N6BO7AP.js";import"./chunk-RU375CWH.js";import{d as oe}from"./chunk-KXJUWRJT.js";import"./chunk-SB5MWYDA.js";import"./chunk-EMZRNCIP.js";import"./chunk-DKHW3YWA.js";import{k as ne,t as ae}from"./chunk-2T5SWUVG.js";import{$b as M,Cb as o,Db as r,Eb as D,Fb as w,Gb as T,Ib as A,Nb as E,Pb as _,Tb as W,Ub as X,Vb as q,Wa as u,Xa as P,Zb as d,cc as J,dc as K,ec as Z,gc as ee,ha as j,hc as te,kc as ie,mb as C,qa as S,qb as Q,ra as x,rb as g,xb as G}from"./chunk-NSU275EB.js";import{g as Ue}from"./chunk-ODN5LVDJ.js";Ye();var $t=Ue(Oe());var je=()=>[5,10,25,50,100],Qe=(a,l,e)=>({"full-time":a,"full-time-designee":l,"part-time":e});function Ge(a,l){a&1&&(o(0,"div",1),D(1,"app-loading"),r())}function We(a,l){a&1&&(o(0,"th",22),d(1," # "),r())}function Xe(a,l){if(a&1&&(o(0,"td",23)(1,"span"),d(2),r()()),a&2){let e=l.index,i=_(2);u(2),M(" ",i.getRowIndex(e)," ")}}function qe(a,l){a&1&&(o(0,"th",24),d(1," Faculty Name "),r())}function Je(a,l){if(a&1&&(o(0,"td",25),d(1),r()),a&2){let e=l.$implicit;u(),M(" ",e.facultyName," ")}}function Ke(a,l){a&1&&(o(0,"th",24),d(1," Faculty Code "),r())}function Ze(a,l){if(a&1&&(o(0,"td",25),d(1),r()),a&2){let e=l.$implicit;u(),M(" ",e.facultyCode," ")}}function et(a,l){a&1&&(o(0,"th",24),d(1," Faculty Type "),r())}function tt(a,l){if(a&1&&(o(0,"td",25)(1,"span",26),d(2),r()()),a&2){let e=l.$implicit;u(),g("ngClass",ie(2,Qe,e.facultyType.toLowerCase().includes("full-time")||e.facultyType.toLowerCase().includes("temporary"),e.facultyType.toLowerCase().includes("designee"),e.facultyType.toLowerCase().includes("part-time"))),u(),M(" ",e.facultyType," ")}}function it(a,l){a&1&&(o(0,"th",24),d(1," Load"),D(2,"br"),d(3," (Units) "),r())}function nt(a,l){if(a&1&&(o(0,"td",25),d(1),r()),a&2){let e=l.$implicit;u(),M(" ",e.facultyUnits," ")}}function at(a,l){a&1&&(o(0,"th",24),d(1," Action "),r())}function ot(a,l){if(a&1){let e=A();o(0,"td",25)(1,"button",27),E("click",function(){let t=S(e).$implicit,n=_(2);return x(n.onView(t))}),o(2,"mat-icon"),d(3,"visibility"),r(),o(4,"span"),d(5,"View Schedule"),r()(),o(6,"button",28),E("click",function(){let t=S(e).$implicit,n=_(2);return x(n.onExportSingle(t))}),o(7,"mat-icon"),d(8,"download"),r(),o(9,"span"),d(10,"Download"),r()()()}}function lt(a,l){if(a&1){let e=A();o(0,"th",24)(1,"mat-slide-toggle",29),E("change",function(t){S(e);let n=_(2);return x(n.onToggleAllChange(t))}),r()()}if(a&2){let e=_(2);u(),g("matTooltip",e.hasSchedulesForToggleAll?"Publish/unpublish schedule for all applicable faculty":"Cannot publish/unpublish empty schedules")("checked",e.isToggleAllChecked)("disabled",!e.hasSchedulesForToggleAll)}}function rt(a,l){if(a&1){let e=A();o(0,"td",25)(1,"mat-slide-toggle",30),Z("ngModelChange",function(t){let n=S(e).$implicit;return K(n.isEnabled,t)||(n.isEnabled=t),x(t)}),E("change",function(){let t=S(e).$implicit,n=_(2);return x(n.onToggleChange(t))}),r()()}if(a&2){let e=l.$implicit;u(),J("ngModel",e.isEnabled),g("disabled",!e.schedules||e.schedules.length===0)("matTooltip",e.schedules&&e.schedules.length>0?"Publish/unpublish schedule for this faculty only":"Cannot publish/unpublish empty schedules")}}function st(a,l){a&1&&D(0,"tr",31)}function ct(a,l){a&1&&D(0,"tr",32)}function dt(a,l){if(a&1&&(o(0,"tr")(1,"td",33)(2,"div",34)(3,"div",35),D(4,"span",36),o(5,"span"),d(6," No faculty found."),r()()()()()),a&2){let e=_(2);u(),Q("colspan",e.displayedColumns.length)}}function ut(a,l){if(a&1){let e=A();o(0,"div",2)(1,"app-table-header",3),E("export",function(){S(e);let t=_();return x(t.onExportAll())})("inputChange",function(t){S(e);let n=_();return x(n.onInputChange(t))}),r()(),o(2,"div",4)(3,"div",5)(4,"table",6),w(5,7),C(6,We,2,0,"th",8)(7,Xe,3,1,"td",9),T(),w(8,10),C(9,qe,2,0,"th",11)(10,Je,2,1,"td",12),T(),w(11,13),C(12,Ke,2,0,"th",11)(13,Ze,2,1,"td",12),T(),w(14,14),C(15,et,2,0,"th",11)(16,tt,3,6,"td",12),T(),w(17,15),C(18,it,4,0,"th",11)(19,nt,2,1,"td",12),T(),w(20,16),C(21,at,2,0,"th",11)(22,ot,11,0,"td",12),T(),w(23,17),C(24,lt,2,3,"th",11)(25,rt,2,3,"td",12),T(),C(26,st,1,0,"tr",18)(27,ct,1,0,"tr",19)(28,dt,7,1,"tr",20),r(),o(29,"mat-paginator",21),E("page",function(){S(e);let t=_();return x(t.updateDisplayedData())}),r()()()}if(a&2){let e=_();g("@fadeAnimation",void 0),u(),g("inputFields",e.inputFields)("showExportButton",!0)("showAddButton",!1),u(),g("@fadeAnimation",void 0),u(2),g("dataSource",e.dataSource),u(22),g("matHeaderRowDef",e.displayedColumns),u(),g("matRowDefColumns",e.displayedColumns),u(2),g("length",e.filteredData.length)("pageSize",10)("pageSizeOptions",te(12,je))("showFirstLastButtons",!0)}}var zt=(()=>{class a{reportsService;dialog;snackBar;sanitizer;inputFields=[{type:"text",label:"Search Faculty",key:"search"}];displayedColumns=["index","facultyName","facultyCode","facultyType","facultyUnits","action","toggle"];dataSource=new Pe;filteredData=[];hasSchedulesForToggleAll=!1;isToggleAllChecked=!1;isLoading=!0;paginator;constructor(e,i,t,n){this.reportsService=e,this.dialog=i,this.snackBar=t,this.sanitizer=n}ngOnInit(){this.fetchFacultyData()}ngAfterViewInit(){this.dataSource.paginator=this.paginator}ngAfterViewChecked(){this.dataSource.paginator!==this.paginator&&(this.dataSource.paginator=this.paginator)}fetchFacultyData(){this.isLoading=!0,this.reportsService.getFacultySchedulesReport().subscribe({next:e=>{let i=e.faculty_schedule_reports.faculties.map(t=>({facultyName:t.faculty_name,facultyCode:t.faculty_code,facultyType:t.faculty_type,facultyUnits:t.assigned_units,isEnabled:t.is_published===1,facultyId:t.faculty_id,schedules:t.schedules||[],academicYear:`${e.faculty_schedule_reports.year_start}-${e.faculty_schedule_reports.year_end}`,semester:this.getSemesterDisplay(e.faculty_schedule_reports.semester)}));this.isLoading=!1,this.dataSource.data=i,this.filteredData=[...i],this.dataSource.paginator=this.paginator,this.hasSchedulesForToggleAll=i.some(t=>t.schedules&&t.schedules.length>0),this.isToggleAllChecked=this.dataSource.data.length>0&&this.dataSource.data.every(t=>t.isEnabled)},error:e=>{this.isLoading=!1,console.error("Error fetching faculty data:",e)}})}getSemesterDisplay(e){switch(e){case 1:return"1st Semester";case 2:return"2nd Semester";case 3:return"Summer Semester";default:return"Unknown Semester"}}getRowIndex(e){return this.paginator?e+1+this.paginator.pageIndex*this.paginator.pageSize:e+1}onInputChange(e){let i=e.search?e.search.trim().toLowerCase():"";i===""?this.dataSource.data=this.filteredData:this.dataSource.data=this.filteredData.filter(t=>t.facultyName.toLowerCase().includes(i)||t.facultyCode.toLowerCase().includes(i)||t.facultyType.toLowerCase().includes(i)),this.isToggleAllChecked=this.dataSource.data.length>0&&this.dataSource.data.every(t=>t.isEnabled)}onView(e){let i=t=>this.createPdfBlob(e);this.dialog.open(z,{maxWidth:"90vw",width:"100%",data:{exportType:"single",entity:"faculty",entityData:e.schedules,customTitle:`${e.facultyName}`,academicYear:e.academicYear,semester:e.semester,generatePdfFunction:i},disableClose:!0})}onExportAll(){if(this.filteredData.length===0){this.snackBar.open("No faculty data available to export.","Close",{duration:3e3});return}let e=i=>this.generateAllSchedulesPdfBlob();this.dialog.open(z,{maxWidth:"90vw",width:"100%",data:{exportType:"all",entity:"faculty",entityData:this.filteredData.map(i=>i.schedules).flat(),customTitle:"All Faculty Schedules",academicYear:this.filteredData[0].academicYear,semester:this.filteredData[0].semester,generatePdfFunction:e,showViewToggle:!1},disableClose:!0})}onExportSingle(e){let i=this.createPdfBlob(e),t=URL.createObjectURL(i),n=document.createElement("a");n.href=t,n.download=`${e.facultyName.replace(/\s+/g,"_")}_Official_Schedule_.pdf`,document.body.appendChild(n),n.click(),document.body.removeChild(n)}onToggleAllChange(e){let i=e.checked?1:0;this.snackBar.open("Loading, please wait...","Close",{duration:void 0}),this.reportsService.togglePublishAllSchedules(i).subscribe({next:t=>{this.dataSource.data.forEach(n=>{n.schedules&&n.schedules.length>0&&(n.isEnabled=i===1)}),this.isToggleAllChecked=this.dataSource.data.length>0&&this.dataSource.data.filter(n=>n.schedules&&n.schedules.length>0).every(n=>n.isEnabled),this.snackBar.open("Schedules successfully published for all applicable faculty.","Close",{duration:3e3})},error:t=>{console.error("Error toggling all schedules:",t),this.isToggleAllChecked=!e.checked,this.snackBar.open("Error publishing schedules for all applicable faculty.","Close",{duration:3e3})}})}onToggleChange(e){let i=e.isEnabled?1:0;this.snackBar.open("Loading, please wait...","Close",{duration:void 0}),this.reportsService.togglePublishSingleSchedule(e.facultyId,i).subscribe({next:t=>{this.isToggleAllChecked=this.dataSource.data.length>0&&this.dataSource.data.every(n=>n.isEnabled),this.snackBar.open(`Schedules successfully published for ${e.facultyName}.`,"Close",{duration:3e3})},error:t=>{console.error(`Error toggling schedule for faculty ${e.facultyId}:`,t),e.isEnabled=!e.isEnabled,this.snackBar.open(`Error publishing schedules for ${e.facultyName}.`,"Close",{duration:3e3})}})}updateDisplayedData(){console.log("Paginator updated")}generateAllSchedulesPdfBlob(){let e=new $("landscape","mm","a4"),i=e.internal.pageSize.width,t=10,n=15,m=22;return this.filteredData.length===0?(this.snackBar.open("No data available to export.","Close",{duration:3e3}),new Blob):(this.filteredData.forEach((p,c)=>{c>0&&e.addPage();let k=this.drawHeader(e,n,i,t,m,`${p.facultyName} Schedule`,this.getAcademicYearSubtitle(p));this.drawScheduleTable(e,p.schedules??[],k,t,i)}),e.output("blob"))}createPdfBlob(e){let i=new $("landscape","mm","a4"),t=i.internal.pageSize.width,n=10,m=15,p=22;if(e.schedules&&e.schedules.length>0){let c=this.drawHeader(i,m,t,n,p,`${e.facultyName}`,this.getAcademicYearSubtitle(e));this.drawScheduleTable(i,e.schedules,c,n,t)}return i.output("blob")}drawHeader(e,i,t,n,m,p,c){let k="https://iantuquib.weebly.com/uploads/5/9/7/7/59776029/2881282_orig.png",I=t/25+25;e.addImage(k,"PNG",I,i-5,m,m),e.setFontSize(12),e.setFont("helvetica","bold"),e.text("POLYTECHNIC UNIVERSITY OF THE PHILIPPINES \u2013 TAGUIG BRANCH",t/2,i,{align:"center"});let s=i+5;return e.setFontSize(10),e.setFont("helvetica","normal"),e.text("Gen. Santos Ave. Upper Bicutan, Taguig City",t/2,s,{align:"center"}),s+=10,e.setFontSize(12),e.setFont("helvetica","bold"),e.text(p,t/2,s,{align:"center"}),s+=8,c&&(e.setFontSize(10),e.setFont("helvetica","normal"),e.text(c,t/2,s,{align:"center"}),s+=8),e.setDrawColor(0,0,0),e.setLineWidth(.5),e.line(n,s,t-n,s),s+=7,s}drawScheduleTable(e,i,t,n,m){let p=["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],c=(m-n*2)/p.length,I=e.internal.pageSize.height-n,s=t,y=s,He=()=>(e.addPage(),s=this.drawHeader(e,15,m,n,22,e.getNumberOfPages()>1?"Faculty Schedule (Continued)":"Faculty Schedule",this.getAcademicYearSubtitle(i[0])),p.forEach((v,F)=>{let h=n+F*c;e.setFillColor(128,0,0),e.setTextColor(255,255,255),e.rect(h,s,c,10,"F"),e.setFontSize(10),e.setFont("helvetica","bold"),e.text(v,h+c/2,s+7,{align:"center"})}),s+=12,s);p.forEach((v,F)=>{let h=n+F*c;e.setFillColor(128,0,0),e.setTextColor(255,255,255),e.rect(h,s,c,10,"F"),e.setFontSize(10),e.setFont("helvetica","bold"),e.text(v,h+c/2,s+7,{align:"center"})}),s+=12,p.forEach((v,F)=>{let h=n+F*c,b=s,U=i.filter(f=>f.day===v).sort((f,Y)=>this.timeToMinutes(f.start_time)-this.timeToMinutes(Y.start_time));U.length>0&&U.forEach(f=>{b+35>I&&(p.forEach((N,R)=>{let V=n+R*c;e.setDrawColor(200,200,200),e.setLineWidth(.5),e.line(V,t,V,y)}),e.line(m-n,t,m-n,y),b=He(),y=b);let $e=this.formatTime(f.start_time),ze=this.formatTime(f.end_time),O=[f.course_details.course_code,f.course_details.course_title,`${f.section_name} - ${f.program_code}`,f.room_code,`${$e} - ${ze}`];e.setFillColor(240,240,240),e.rect(h,b,c,35,"F");let L=b+5;O.forEach((N,R)=>{if(e.setTextColor(0),e.setFontSize(9),e.setFont((R<=1,"helvetica"),R<=1?"bold":"normal"),e.splitTextToSize(N,c-10).forEach(H=>{e.text(H,h+5,L),L+=5}),R===O.length-1){let H=e.getTextWidth(N);e.setDrawColor(0,0,0),e.setLineWidth(.2),e.line(h+5,L-4,h+5+H,L-4)}}),b+=40,b>y&&(y=b)})}),p.forEach((v,F)=>{let h=n+F*c;e.setDrawColor(200,200,200),e.setLineWidth(.5),e.line(h,t,h,y)}),e.line(m-n,t,m-n,y),e.line(n,y,m-n,y)}formatTime(e){let[i,t]=e.split(":").map(Number),n=i>=12?"PM":"AM";return`${i%12||12}:${t.toString().padStart(2,"0")} ${n}`}timeToMinutes(e){let[i,t]=e.split(":").map(Number);return i*60+t}getAcademicYearSubtitle(e){return`For Academic Year ${e.academicYear}, ${e.semester}`}static \u0275fac=function(i){return new(i||a)(P(_e),P(ce),P(Le),P(oe))};static \u0275cmp=j({type:a,selectors:[["app-report-faculty"]],viewQuery:function(i,t){if(i&1&&W(B,5),i&2){let n;X(n=q())&&(t.paginator=n.first)}},standalone:!0,features:[ee],decls:3,vars:1,consts:[[1,"report-container"],[1,"loading-wrapper"],[1,"report-header-container"],[3,"export","inputChange","inputFields","showExportButton","showAddButton"],[1,"report-table-container"],[1,"table-container"],["mat-table","",1,"custom-table",3,"dataSource"],["matColumnDef","index"],["mat-header-cell","","class","custom-header index",4,"matHeaderCellDef"],["mat-cell","","class","index",4,"matCellDef"],["matColumnDef","facultyName"],["mat-header-cell","","class","custom-header",4,"matHeaderCellDef"],["mat-cell","","class","custom-cell",4,"matCellDef"],["matColumnDef","facultyCode"],["matColumnDef","facultyType"],["matColumnDef","facultyUnits"],["matColumnDef","action"],["matColumnDef","toggle"],["mat-header-row","",4,"matHeaderRowDef"],["mat-row","",4,"matRowDef","matRowDefColumns"],[4,"matNoDataRow"],["aria-label","Select page",1,"custom-paginator",3,"page","length","pageSize","pageSizeOptions","showFirstLastButtons"],["mat-header-cell","",1,"custom-header","index"],["mat-cell","",1,"index"],["mat-header-cell","",1,"custom-header"],["mat-cell","",1,"custom-cell"],[1,"faculty-type",3,"ngClass"],["mat-button","",1,"sec-ripple","view-button",3,"click"],["mat-button","",1,"sec-ripple","export-button",3,"click"],[1,"header-toggle",3,"change","matTooltip","checked","disabled"],[3,"ngModelChange","change","ngModel","disabled","matTooltip"],["mat-header-row",""],["mat-row",""],[1,"no-data-cell"],[1,"flex-cell"],[1,"no-data-text"],["mat-symbol","info"]],template:function(i,t){i&1&&(o(0,"div",0),C(1,Ge,2,0,"div",1)(2,ut,30,13),r()),i&2&&(u(),G(t.isLoading?1:2))},dependencies:[ae,ne,Ve,pe,Re,ye,xe,Fe,be,Se,Ee,we,Te,ve,De,Me,Ne,B,ke,Ae,Ie,Be,me,ue,re,le,Ce,fe,ge,de,se],data:{animation:[he]}})}return a})();export{zt as ReportFacultyComponent};
