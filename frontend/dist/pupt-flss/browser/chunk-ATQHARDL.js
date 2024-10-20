import{a as H}from"./chunk-HDBGLD52.js";import"./chunk-R7WH3GYF.js";import{a as P}from"./chunk-PAWPQVJP.js";import{f as g}from"./chunk-2PMUV4MH.js";import"./chunk-OJYR24EB.js";import"./chunk-A3A72ILT.js";import{a as j}from"./chunk-TVMSW2JO.js";import"./chunk-CUKNIT7M.js";import{a as B}from"./chunk-AY56TXUB.js";import{v as V}from"./chunk-VMH4ILIM.js";import"./chunk-6AWQUBPH.js";import"./chunk-HZKDOO2A.js";import"./chunk-JLIX64RS.js";import{c as T}from"./chunk-VORQTW3B.js";import"./chunk-FVBRAVME.js";import"./chunk-L2D7AHNW.js";import"./chunk-POHCU53O.js";import{a as N}from"./chunk-6QI4QBU5.js";import"./chunk-DXFFT4B6.js";import"./chunk-UJ255QIO.js";import"./chunk-MXV4M2BO.js";import"./chunk-4N6BO7AP.js";import"./chunk-RU375CWH.js";import"./chunk-KXJUWRJT.js";import{a as E}from"./chunk-SB5MWYDA.js";import{a as D}from"./chunk-EMZRNCIP.js";import{a as L,c as A}from"./chunk-DKHW3YWA.js";import{t as I}from"./chunk-2T5SWUVG.js";import{B as r,Cb as y,Db as m,Eb as v,Ib as k,Nb as h,Pb as l,Wa as p,Xa as d,Z as C,ca as f,gc as w,ha as b,l as n,mb as F,p as _,qa as c,ra as s,rb as u,xb as x,zc as S}from"./chunk-NSU275EB.js";import"./chunk-ODN5LVDJ.js";var U=(()=>{class o{http;cookieService;baseUrl=D.apiUrl;constructor(e,t){this.http=e,this.cookieService=t}getHeaders(){let e=this.cookieService.get("token");return new L({Authorization:`Bearer ${e}`,"Content-Type":"application/json",Accept:"application/json"})}getFaculty(){return this.http.get(`${this.baseUrl}/showAccounts`,{headers:this.getHeaders()}).pipe(_(e=>{if(!Array.isArray(e))throw new Error("Unexpected response format");return e.filter(t=>t.role==="faculty").map(t=>({id:t.id.toString(),name:t.name,code:t.code,faculty_email:t.faculty?.faculty_email||"",faculty_type:t.faculty?.faculty_type||"",faculty_units:t.faculty?.faculty_units??0,status:t.status||"Active",role:t.role}))}),r(e=>(console.error("Error fetching faculty:",e),n([]))))}addFaculty(e){return this.http.post(`${this.baseUrl}/addAccount`,e,{headers:this.getHeaders()})}updateFaculty(e,t){return this.http.put(`${this.baseUrl}/updateAccount/${e}`,t,{headers:this.getHeaders()})}deleteFaculty(e){return this.http.delete(`${this.baseUrl}/deleteAccount/${e}`,{headers:this.getHeaders()})}static \u0275fac=function(t){return new(t||o)(f(A),f(E))};static \u0275prov=C({token:o,factory:o.\u0275fac,providedIn:"root"})}return o})();function O(o,q){o&1&&v(0,"app-loading")}function R(o,q){if(o&1){let e=k();y(0,"div",0)(1,"div",1)(2,"app-table-header",2),h("search",function(a){c(e);let i=l();return s(i.onSearch(a))})("add",function(){c(e);let a=l();return s(a.openAddFacultyDialog())}),m()(),y(3,"div",3)(4,"app-table-generic",4),h("edit",function(a){c(e);let i=l();return s(i.openEditFacultyDialog(a))})("delete",function(a){c(e);let i=l();return s(i.deleteFaculty(a))}),m()()()}if(o&2){let e=l();u("@fadeAnimation",void 0),p(2),u("searchLabel","Search Faculty")("addButtonLabel","Add Faculty")("inputFields",e.headerInputFields),p(2),u("columns",e.columns)("data",e.faculty)("tableName","faculty")("displayedColumns",e.displayedColumns)("showViewButton",!1)}}var le=(()=>{class o{cdr;dialog;snackBar;facultyService;facultyStatuses=["Active","Inactive"];facultyTypes=["Full-time (Permanent)","Full-time (Temporary)","Full-time (Designee)","Part-time"];selectedFacultyIndex=null;faculty=[];isLoading=!0;columns=[{key:"index",label:"#"},{key:"code",label:"Faculty Code"},{key:"name",label:"Name"},{key:"faculty_email",label:"Email"},{key:"faculty_type",label:"Type"},{key:"faculty_units",label:"Units Assigned"},{key:"status",label:"Status"}];displayedColumns=["index","code","name","faculty_email","faculty_type","faculty_units","status","action"];headerInputFields=[{type:"text",label:"Search Faculty",key:"search"}];constructor(e,t,a,i){this.cdr=e,this.dialog=t,this.snackBar=a,this.facultyService=i}ngOnInit(){this.fetchFaculty()}fetchFaculty(){this.isLoading=!0,this.facultyService.getFaculty().pipe(r(e=>(console.error("Error fetching faculty:",e),this.snackBar.open("Error fetching faculty. Please try again.","Close",{duration:3e3}),this.isLoading=!1,n([])))).subscribe(e=>{this.faculty=e.map((t,a)=>({id:t.id,code:t.code,name:t.name,faculty_email:t.faculty_email||"",faculty_type:t.faculty_type||"",faculty_units:t.faculty_units||0,status:t.status||"Active",role:t.role})),this.isLoading=!1,this.cdr.markForCheck()})}onSearch(e){this.facultyService.getFaculty().pipe(r(t=>(console.error("Error fetching faculty for search:",t),n([])))).subscribe(t=>{this.faculty=t.filter(a=>a.code.includes(e)||a.name.toLowerCase().includes(e.toLowerCase())||a.faculty_type.toLowerCase().includes(e.toLowerCase())),this.cdr.markForCheck()})}getDialogConfig(e){return{title:"Faculty",isEdit:!!e,fields:[{label:"Faculty Code",formControlName:"code",type:"text",maxLength:12,required:!0,disabled:!!e},{label:"Name",formControlName:"name",type:"text",maxLength:50,required:!0},{label:"Password",formControlName:"password",type:"text",maxLength:100,required:!1},{label:"Confirm Password",formControlName:"confirmPassword",type:"text",maxLength:100,required:!1,confirmPassword:!0},{label:"Email",formControlName:"faculty_email",type:"text",maxLength:100,required:!0},{label:"Type",formControlName:"faculty_type",type:"select",options:this.facultyTypes,required:!0},{label:"Units Assigned",formControlName:"faculty_units",type:"number",required:!0},{label:"Status",formControlName:"status",type:"select",options:this.facultyStatuses,required:!0}],initialValue:e||{}}}openAddFacultyDialog(){let e=this.getDialogConfig();this.dialog.open(g,{data:e,disableClose:!0}).afterClosed().subscribe(a=>{a&&(a.role="faculty",this.facultyService.addFaculty(a).pipe(r(i=>(console.error("Error adding faculty:",i),n(null)))).subscribe(i=>{i&&(this.faculty.push(i),this.snackBar.open("Faculty added successfully","Close",{duration:3e3}),this.fetchFaculty(),this.cdr.markForCheck())}))})}openEditFacultyDialog(e){this.selectedFacultyIndex=this.faculty.indexOf(e);let t=this.getDialogConfig(e);this.dialog.open(g,{data:t,disableClose:!0}).afterClosed().subscribe(i=>{i&&this.selectedFacultyIndex!==null&&this.updateFaculty(i)})}updateFaculty(e){if(this.selectedFacultyIndex!==null&&this.selectedFacultyIndex!==void 0){let t=this.faculty[this.selectedFacultyIndex];if(t&&t.id){let a=t.id;e.role="faculty",(e.password==="********"||!e.password)&&delete e.password,this.facultyService.updateFaculty(a,e).pipe(r(i=>(console.error("Error updating faculty:",i),n(null)))).subscribe(i=>{i&&(this.faculty[this.selectedFacultyIndex]=i,this.snackBar.open("Faculty updated successfully","Close",{duration:3e3}),this.fetchFaculty(),this.cdr.markForCheck())})}}}deleteFaculty(e){let t=e.id;this.facultyService.deleteFaculty(t).pipe(r(a=>(console.error("Error deleting faculty:",a),n(null)))).subscribe(()=>{this.faculty=this.faculty.filter(a=>a.id!==t),this.snackBar.open("Faculty deleted successfully","Close",{duration:3e3}),this.cdr.markForCheck()})}static \u0275fac=function(t){return new(t||o)(d(S),d(T),d(j),d(U))};static \u0275cmp=b({type:o,selectors:[["app-faculty"]],standalone:!0,features:[w],decls:2,vars:1,consts:[[1,"faculty-management-container"],[1,"faculty-header-container"],[3,"search","add","searchLabel","addButtonLabel","inputFields"],[1,"faculty-table-container"],[3,"edit","delete","columns","data","tableName","displayedColumns","showViewButton"]],template:function(t,a){t&1&&F(0,O,1,0,"app-loading")(1,R,5,9,"div",0),t&2&&x(a.isLoading?0:1)},dependencies:[I,V,H,P,B],styles:[".faculty-management-container[_ngcontent-%COMP%]{transition:background-color .3s ease;display:flex;flex-direction:column;gap:var(--spacing-xs);height:100%}.faculty-table-container[_ngcontent-%COMP%]{display:flex;flex-direction:column;align-items:none;justify-content:none;gap:0;-ms-overflow-style:none;scrollbar-width:none;flex:1;overflow:auto;position:relative;border-radius:var(--border-radius-md)}.faculty-table-container[_ngcontent-%COMP%]::-webkit-scrollbar{display:none}"],data:{animation:[N]},changeDetection:0})}return o})();export{le as FacultyComponent};
