/*! HausKlima Card v0.1.0 | MIT License | https://github.com/tach2004/hausklima-card */
var Gt=Object.defineProperty;var b=(o,e)=>()=>(o&&(e=o(o=0)),e);var jt=(o,e)=>{for(var t in e)Gt(o,t,{get:e[t],enumerable:!0})};var ne,ae,Ee,Je,q,Xe,R,et,Se,Ae=b(()=>{/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */ne=globalThis,ae=ne.ShadowRoot&&(ne.ShadyCSS===void 0||ne.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,Ee=Symbol(),Je=new WeakMap,q=class{constructor(e,t,i){if(this._$cssResult$=!0,i!==Ee)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o,t=this.t;if(ae&&e===void 0){let i=t!==void 0&&t.length===1;i&&(e=Je.get(t)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),i&&Je.set(t,e))}return e}toString(){return this.cssText}},Xe=o=>new q(typeof o=="string"?o:o+"",void 0,Ee),R=(o,...e)=>{let t=o.length===1?o[0]:e.reduce((i,s,r)=>i+(n=>{if(n._$cssResult$===!0)return n.cssText;if(typeof n=="number")return n;throw Error("Value passed to 'css' function must be a 'css' function result: "+n+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(s)+o[r+1],o[0]);return new q(t,o,Ee)},et=(o,e)=>{if(ae)o.adoptedStyleSheets=e.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(let t of e){let i=document.createElement("style"),s=ne.litNonce;s!==void 0&&i.setAttribute("nonce",s),i.textContent=t.cssText,o.appendChild(i)}},Se=ae?o=>o:o=>o instanceof CSSStyleSheet?(e=>{let t="";for(let i of e.cssRules)t+=i.cssText;return Xe(t)})(o):o});var Wt,Vt,Zt,Ft,qt,Yt,le,tt,Qt,Jt,Y,Re,st,it,C,de=b(()=>{Ae();Ae();/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */({is:Wt,defineProperty:Vt,getOwnPropertyDescriptor:Zt,getOwnPropertyNames:Ft,getOwnPropertySymbols:qt,getPrototypeOf:Yt}=Object),le=globalThis,tt=le.trustedTypes,Qt=tt?tt.emptyScript:"",Jt=le.reactiveElementPolyfillSupport,Y=(o,e)=>o,Re={toAttribute(o,e){switch(e){case Boolean:o=o?Qt:null;break;case Object:case Array:o=o==null?o:JSON.stringify(o)}return o},fromAttribute(o,e){let t=o;switch(e){case Boolean:t=o!==null;break;case Number:t=o===null?null:Number(o);break;case Object:case Array:try{t=JSON.parse(o)}catch{t=null}}return t}},st=(o,e)=>!Wt(o,e),it={attribute:!0,type:String,converter:Re,reflect:!1,useDefault:!1,hasChanged:st};Symbol.metadata??=Symbol("metadata"),le.litPropertyMetadata??=new WeakMap;C=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=it){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){let i=Symbol(),s=this.getPropertyDescriptor(e,i,t);s!==void 0&&Vt(this.prototype,e,s)}}static getPropertyDescriptor(e,t,i){let{get:s,set:r}=Zt(this.prototype,e)??{get(){return this[t]},set(n){this[t]=n}};return{get:s,set(n){let a=s?.call(this);r?.call(this,n),this.requestUpdate(e,a,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??it}static _$Ei(){if(this.hasOwnProperty(Y("elementProperties")))return;let e=Yt(this);e.finalize(),e.l!==void 0&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(Y("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(Y("properties"))){let t=this.properties,i=[...Ft(t),...qt(t)];for(let s of i)this.createProperty(s,t[s])}let e=this[Symbol.metadata];if(e!==null){let t=litPropertyMetadata.get(e);if(t!==void 0)for(let[i,s]of t)this.elementProperties.set(i,s)}this._$Eh=new Map;for(let[t,i]of this.elementProperties){let s=this._$Eu(t,i);s!==void 0&&this._$Eh.set(s,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){let t=[];if(Array.isArray(e)){let i=new Set(e.flat(1/0).reverse());for(let s of i)t.unshift(Se(s))}else e!==void 0&&t.push(Se(e));return t}static _$Eu(e,t){let i=t.attribute;return i===!1?void 0:typeof i=="string"?i:typeof e=="string"?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),this.renderRoot!==void 0&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){let e=new Map,t=this.constructor.elementProperties;for(let i of t.keys())this.hasOwnProperty(i)&&(e.set(i,this[i]),delete this[i]);e.size>0&&(this._$Ep=e)}createRenderRoot(){let e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return et(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,i){this._$AK(e,i)}_$ET(e,t){let i=this.constructor.elementProperties.get(e),s=this.constructor._$Eu(e,i);if(s!==void 0&&i.reflect===!0){let r=(i.converter?.toAttribute!==void 0?i.converter:Re).toAttribute(t,i.type);this._$Em=e,r==null?this.removeAttribute(s):this.setAttribute(s,r),this._$Em=null}}_$AK(e,t){let i=this.constructor,s=i._$Eh.get(e);if(s!==void 0&&this._$Em!==s){let r=i.getPropertyOptions(s),n=typeof r.converter=="function"?{fromAttribute:r.converter}:r.converter?.fromAttribute!==void 0?r.converter:Re;this._$Em=s;let a=n.fromAttribute(t,r.type);this[s]=a??this._$Ej?.get(s)??a,this._$Em=null}}requestUpdate(e,t,i,s=!1,r){if(e!==void 0){let n=this.constructor;if(s===!1&&(r=this[e]),i??=n.getPropertyOptions(e),!((i.hasChanged??st)(r,t)||i.useDefault&&i.reflect&&r===this._$Ej?.get(e)&&!this.hasAttribute(n._$Eu(e,i))))return;this.C(e,t,i)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(e,t,{useDefault:i,reflect:s,wrapped:r},n){i&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,n??t??this[e]),r!==!0||n!==void 0)||(this._$AL.has(e)||(this.hasUpdated||i||(t=void 0),this._$AL.set(e,t)),s===!0&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}let e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(let[s,r]of this._$Ep)this[s]=r;this._$Ep=void 0}let i=this.constructor.elementProperties;if(i.size>0)for(let[s,r]of i){let{wrapped:n}=r,a=this[s];n!==!0||this._$AL.has(s)||a===void 0||this.C(s,void 0,r,a)}}let e=!1,t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(i=>i.hostUpdate?.()),this.update(t)):this._$EM()}catch(i){throw e=!1,this._$EM(),i}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM()}updated(e){}firstUpdated(e){}};C.elementStyles=[],C.shadowRootOptions={mode:"open"},C[Y("elementProperties")]=new Map,C[Y("finalized")]=new Map,Jt?.({ReactiveElement:C}),(le.reactiveElementVersions??=[]).push("2.1.2")});function mt(o,e){if(!Le(o)||!o.hasOwnProperty("raw"))throw Error("invalid template strings array");return ot!==void 0?ot.createHTML(e):e}function z(o,e,t=o,i){if(e===y)return e;let s=i!==void 0?t._$Co?.[i]:t._$Cl,r=X(e)?void 0:e._$litDirective$;return s?.constructor!==r&&(s?._$AO?.(!1),r===void 0?s=void 0:(s=new r(o),s._$AT(o,t,i)),i!==void 0?(t._$Co??=[])[i]=s:t._$Cl=s),s!==void 0&&(e=z(o,s._$AS(o,e.values),s,i)),e}var Te,rt,ce,ot,He,E,ze,Xt,H,J,X,Le,ht,Me,Q,nt,at,M,lt,dt,pt,De,g,f,fi,y,u,ct,T,ut,ee,he,K,L,pe,me,ue,ge,gt,ei,ft,D=b(()=>{/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */Te=globalThis,rt=o=>o,ce=Te.trustedTypes,ot=ce?ce.createPolicy("lit-html",{createHTML:o=>o}):void 0,He="$lit$",E=`lit$${Math.random().toFixed(9).slice(2)}$`,ze="?"+E,Xt=`<${ze}>`,H=document,J=()=>H.createComment(""),X=o=>o===null||typeof o!="object"&&typeof o!="function",Le=Array.isArray,ht=o=>Le(o)||typeof o?.[Symbol.iterator]=="function",Me=`[ 	
\f\r]`,Q=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,nt=/-->/g,at=/>/g,M=RegExp(`>|${Me}(?:([^\\s"'>=/]+)(${Me}*=${Me}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),lt=/'/g,dt=/"/g,pt=/^(?:script|style|textarea|title)$/i,De=o=>(e,...t)=>({_$litType$:o,strings:e,values:t}),g=De(1),f=De(2),fi=De(3),y=Symbol.for("lit-noChange"),u=Symbol.for("lit-nothing"),ct=new WeakMap,T=H.createTreeWalker(H,129);ut=(o,e)=>{let t=o.length-1,i=[],s,r=e===2?"<svg>":e===3?"<math>":"",n=Q;for(let a=0;a<t;a++){let l=o[a],h,c,d=-1,p=0;for(;p<l.length&&(n.lastIndex=p,c=n.exec(l),c!==null);)p=n.lastIndex,n===Q?c[1]==="!--"?n=nt:c[1]!==void 0?n=at:c[2]!==void 0?(pt.test(c[2])&&(s=RegExp("</"+c[2],"g")),n=M):c[3]!==void 0&&(n=M):n===M?c[0]===">"?(n=s??Q,d=-1):c[1]===void 0?d=-2:(d=n.lastIndex-c[2].length,h=c[1],n=c[3]===void 0?M:c[3]==='"'?dt:lt):n===dt||n===lt?n=M:n===nt||n===at?n=Q:(n=M,s=void 0);let m=n===M&&o[a+1].startsWith("/>")?" ":"";r+=n===Q?l+Xt:d>=0?(i.push(h),l.slice(0,d)+He+l.slice(d)+E+m):l+E+(d===-2?a:m)}return[mt(o,r+(o[t]||"<?>")+(e===2?"</svg>":e===3?"</math>":"")),i]},ee=class o{constructor({strings:e,_$litType$:t},i){let s;this.parts=[];let r=0,n=0,a=e.length-1,l=this.parts,[h,c]=ut(e,t);if(this.el=o.createElement(h,i),T.currentNode=this.el.content,t===2||t===3){let d=this.el.content.firstChild;d.replaceWith(...d.childNodes)}for(;(s=T.nextNode())!==null&&l.length<a;){if(s.nodeType===1){if(s.hasAttributes())for(let d of s.getAttributeNames())if(d.endsWith(He)){let p=c[n++],m=s.getAttribute(d).split(E),v=/([.?@])?(.*)/.exec(p);l.push({type:1,index:r,name:v[2],strings:m,ctor:v[1]==="."?pe:v[1]==="?"?me:v[1]==="@"?ue:L}),s.removeAttribute(d)}else d.startsWith(E)&&(l.push({type:6,index:r}),s.removeAttribute(d));if(pt.test(s.tagName)){let d=s.textContent.split(E),p=d.length-1;if(p>0){s.textContent=ce?ce.emptyScript:"";for(let m=0;m<p;m++)s.append(d[m],J()),T.nextNode(),l.push({type:2,index:++r});s.append(d[p],J())}}}else if(s.nodeType===8)if(s.data===ze)l.push({type:2,index:r});else{let d=-1;for(;(d=s.data.indexOf(E,d+1))!==-1;)l.push({type:7,index:r}),d+=E.length-1}r++}}static createElement(e,t){let i=H.createElement("template");return i.innerHTML=e,i}};he=class{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){let{el:{content:t},parts:i}=this._$AD,s=(e?.creationScope??H).importNode(t,!0);T.currentNode=s;let r=T.nextNode(),n=0,a=0,l=i[0];for(;l!==void 0;){if(n===l.index){let h;l.type===2?h=new K(r,r.nextSibling,this,e):l.type===1?h=new l.ctor(r,l.name,l.strings,this,e):l.type===6&&(h=new ge(r,this,e)),this._$AV.push(h),l=i[++a]}n!==l?.index&&(r=T.nextNode(),n++)}return T.currentNode=H,s}p(e){let t=0;for(let i of this._$AV)i!==void 0&&(i.strings!==void 0?(i._$AI(e,i,t),t+=i.strings.length-2):i._$AI(e[t])),t++}},K=class o{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,i,s){this.type=2,this._$AH=u,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=i,this.options=s,this._$Cv=s?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode,t=this._$AM;return t!==void 0&&e?.nodeType===11&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=z(this,e,t),X(e)?e===u||e==null||e===""?(this._$AH!==u&&this._$AR(),this._$AH=u):e!==this._$AH&&e!==y&&this._(e):e._$litType$!==void 0?this.$(e):e.nodeType!==void 0?this.T(e):ht(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==u&&X(this._$AH)?this._$AA.nextSibling.data=e:this.T(H.createTextNode(e)),this._$AH=e}$(e){let{values:t,_$litType$:i}=e,s=typeof i=="number"?this._$AC(e):(i.el===void 0&&(i.el=ee.createElement(mt(i.h,i.h[0]),this.options)),i);if(this._$AH?._$AD===s)this._$AH.p(t);else{let r=new he(s,this),n=r.u(this.options);r.p(t),this.T(n),this._$AH=r}}_$AC(e){let t=ct.get(e.strings);return t===void 0&&ct.set(e.strings,t=new ee(e)),t}k(e){Le(this._$AH)||(this._$AH=[],this._$AR());let t=this._$AH,i,s=0;for(let r of e)s===t.length?t.push(i=new o(this.O(J()),this.O(J()),this,this.options)):i=t[s],i._$AI(r),s++;s<t.length&&(this._$AR(i&&i._$AB.nextSibling,s),t.length=s)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){let i=rt(e).nextSibling;rt(e).remove(),e=i}}setConnected(e){this._$AM===void 0&&(this._$Cv=e,this._$AP?.(e))}},L=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,i,s,r){this.type=1,this._$AH=u,this._$AN=void 0,this.element=e,this.name=t,this._$AM=s,this.options=r,i.length>2||i[0]!==""||i[1]!==""?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=u}_$AI(e,t=this,i,s){let r=this.strings,n=!1;if(r===void 0)e=z(this,e,t,0),n=!X(e)||e!==this._$AH&&e!==y,n&&(this._$AH=e);else{let a=e,l,h;for(e=r[0],l=0;l<r.length-1;l++)h=z(this,a[i+l],t,l),h===y&&(h=this._$AH[l]),n||=!X(h)||h!==this._$AH[l],h===u?e=u:e!==u&&(e+=(h??"")+r[l+1]),this._$AH[l]=h}n&&!s&&this.j(e)}j(e){e===u?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}},pe=class extends L{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===u?void 0:e}},me=class extends L{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==u)}},ue=class extends L{constructor(e,t,i,s,r){super(e,t,i,s,r),this.type=5}_$AI(e,t=this){if((e=z(this,e,t,0)??u)===y)return;let i=this._$AH,s=e===u&&i!==u||e.capture!==i.capture||e.once!==i.once||e.passive!==i.passive,r=e!==u&&(i===u||s);s&&this.element.removeEventListener(this.name,this,i),r&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}},ge=class{constructor(e,t,i){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(e){z(this,e)}},gt={M:He,P:E,A:ze,C:1,L:ut,R:he,D:ht,V:z,I:K,H:L,N:me,U:ue,B:pe,F:ge},ei=Te.litHtmlPolyfillSupport;ei?.(ee,K),(Te.litHtmlVersions??=[]).push("3.3.3");ft=(o,e,t)=>{let i=t?.renderBefore??e,s=i._$litPart$;if(s===void 0){let r=t?.renderBefore??null;i._$litPart$=s=new K(e.insertBefore(J(),r),r,void 0,t??{})}return s._$AI(o),s}});var Pe,k,ti,$t=b(()=>{de();de();D();D();/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */Pe=globalThis,k=class extends C{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){let e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){let t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=ft(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return y}};k._$litElement$=!0,k.finalized=!0,Pe.litElementHydrateSupport?.({LitElement:k});ti=Pe.litElementPolyfillSupport;ti?.({LitElement:k});(Pe.litElementVersions??=[]).push("4.2.2")});var bt=b(()=>{/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */});var G=b(()=>{de();D();$t();bt()});function vt(){return structuredClone(ii)}var ii,yt=b(()=>{"use strict";ii={house:{width_m:12,depth_m:10},garage:{width_m:6,depth_m:6,height_m:3,gap_m:5,gap_is_approximate:!0},walls:{stated_thickness_m:.24,exterior_thickness_m:null,interior_thickness_m:null},roof:{knee_wall_height_m:1,interior_ridge_height_m:4,pitch_degrees:null},levels:[{id:"basement",name:"Keller",building_id:"house",clear_height_m:2.5},{id:"ground_floor",name:"Erdgeschoss",building_id:"house",clear_height_m:2.64},{id:"attic",name:"Dachgeschoss",building_id:"house",clear_height_m:null},{id:"garage",name:"Garage",building_id:"garage",clear_height_m:null}],layers:[{id:"main",name:"Sichtbare Raumebene"}],rooms:[{id:"workshop",name:"Werkstatt",level_id:"basement",layer_id:"main",visible:!0,width_m:4},{id:"basement_hall",name:"Flur",level_id:"basement",layer_id:"main",visible:!0,width_m:3.4},{id:"laundry",name:"Waschk\xFCche",level_id:"basement",layer_id:"main",visible:!0,width_m:3.5},{id:"living_room",name:"Wohnzimmer",level_id:"ground_floor",layer_id:"main",visible:!0,width_m:6.5},{id:"ground_hall",name:"Flur",level_id:"ground_floor",layer_id:"main",visible:!0,width_m:.9},{id:"kitchen",name:"K\xFCche",level_id:"ground_floor",layer_id:"main",visible:!0,width_m:3.51},{id:"bedroom",name:"Schlafzimmer",level_id:"attic",layer_id:"main",visible:!0,width_m:7.6},{id:"storage",name:"Abstellraum",level_id:"attic",layer_id:"main",visible:!0,width_m:3.6},{id:"garage",name:"Garage",level_id:"garage",layer_id:"main",visible:!0,width_m:6}],notes:["Die Raumma\xDFe schlie\xDFen die 12 m Au\xDFenbreite nicht vollst\xE4ndig. Es erfolgt keine automatische Anpassung.","0,24 m ist eine angegebene Wandst\xE4rke. Ihre Zuordnung zu Au\xDFen- und Innenw\xE4nden ist offen.","Die 12-m-Traufseite ist sichtbar; der Dachfirst verl\xE4uft parallel zur Fassade.","Dachneigung, Dach\xFCberst\xE4nde, Deckendicken und endg\xFCltige Cutaway-Tiefe sind ungekl\xE4rt.","Die freistehende Garage liegt rechts vom Haus; der Abstand betr\xE4gt ungef\xE4hr 5 m."]}});var j,fe=b(()=>{"use strict";j=["temperature","relative_humidity","absolute_humidity","co2","voc"]});function x(o,e){if(o===null||typeof o!="object"||Array.isArray(o))throw new Error(`${e} muss ein Objekt sein.`);return o}function P(o,e){if(typeof o!="string"||o.trim()==="")throw new Error(`${e} muss eine nicht leere Zeichenfolge sein.`)}function _(o,e,t=!1){if(!(t&&o===null)&&(typeof o!="number"||!Number.isFinite(o)||o<=0))throw new Error(`${e} muss eine positive, endliche Zahl${t?" oder null":""} sein.`)}function W(o,e){if(typeof o!="boolean")throw new Error(`${e} muss ein boolescher Wert sein.`)}function Ie(o,e){if(!Array.isArray(o))throw new Error(`${e} muss eine Liste sein.`);return o}function Ne(o,e){let t=Ie(o,e).map((s,r)=>x(s,`${e}[${r}]`)),i=new Set;return t.forEach((s,r)=>{if(P(s.id,`${e}[${r}].id`),P(s.name,`${e}[${r}].name`),i.has(s.id))throw new Error(`${e}: doppelte ID ${s.id}.`);i.add(s.id)}),t}function si(o,e){let t=x(o,e);for(let[i,s]of Object.entries(t)){if(!j.includes(i))throw new Error(`${e}: unbekannter Messwerttyp ${i}.`);let r=`${e}.${i}`,n=x(s,r),a=Ie(n.sensors,`${r}.sensors`),l=new Set;if(a.forEach((h,c)=>{let d=x(h,`${r}.sensors[${c}]`);if(P(d.entity,`${r}.sensors[${c}].entity`),!/^[a-z_][a-z0-9_]*\.[a-z0-9_]+$/.test(d.entity))throw new Error(`${r}: ung\xFCltige Entity-ID ${d.entity}.`);if(l.has(d.entity))throw new Error(`${r}: doppelte Entity-ID ${d.entity}.`);l.add(d.entity),d.name!==void 0&&P(d.name,`${r}.sensors[${c}].name`)}),n.primary!==void 0&&(P(n.primary,`${r}.primary`),!l.has(n.primary)))throw new Error(`${r}.primary muss einen konfigurierten Sensor referenzieren.`);if(n.visible!==void 0&&W(n.visible,`${r}.visible`),n.show_in_overview!==void 0&&W(n.show_in_overview,`${r}.show_in_overview`),n.position!==void 0){let h=x(n.position,`${r}.position`);for(let c of["x","y"]){let d=h[c];if(typeof d!="number"||!Number.isFinite(d)||d<0||d>1)throw new Error(`${r}.position.${c} muss zwischen 0 und 1 liegen.`)}}}}function ri(o){let e=x(o,"building"),t=x(e.house,"building.house");_(t.width_m,"building.house.width_m"),_(t.depth_m,"building.house.depth_m");let i=x(e.garage,"building.garage");for(let d of["width_m","depth_m","height_m","gap_m"])_(i[d],`building.garage.${d}`);W(i.gap_is_approximate,"building.garage.gap_is_approximate");let s=x(e.walls,"building.walls");_(s.stated_thickness_m,"building.walls.stated_thickness_m"),_(s.exterior_thickness_m,"building.walls.exterior_thickness_m",!0),_(s.interior_thickness_m,"building.walls.interior_thickness_m",!0);let r=x(e.roof,"building.roof");if(_(r.knee_wall_height_m,"building.roof.knee_wall_height_m"),_(r.interior_ridge_height_m,"building.roof.interior_ridge_height_m"),_(r.pitch_degrees,"building.roof.pitch_degrees",!0),typeof r.pitch_degrees=="number"&&r.pitch_degrees>=90)throw new Error("building.roof.pitch_degrees muss kleiner als 90 sein.");if(r.interior_ridge_height_m<r.knee_wall_height_m)throw new Error("Die Firsth\xF6he darf nicht unter der Kniestockh\xF6he liegen.");let n=Ne(e.levels,"building.levels"),a=Ne(e.layers,"building.layers"),l=Ne(e.rooms,"building.rooms");if(n.length===0)throw new Error("building.levels ben\xF6tigt mindestens eine Ebene.");n.forEach((d,p)=>{if(d.building_id!=="house"&&d.building_id!=="garage")throw new Error(`building.levels[${p}].building_id muss house oder garage sein.`);_(d.clear_height_m,`building.levels[${p}].clear_height_m`,!0)});let h=new Set(n.map(d=>d.id)),c=new Set(a.map(d=>d.id));l.forEach((d,p)=>{let m=`building.rooms[${p}]`;if(P(d.level_id,`${m}.level_id`),!h.has(d.level_id))throw new Error(`${m}.level_id referenziert keine vorhandene Ebene.`);if(d.layer_id!==void 0&&!c.has(d.layer_id))throw new Error(`${m}.layer_id referenziert keine vorhandene Raumebene.`);if(W(d.visible,`${m}.visible`),d.location!==void 0&&d.location!=="indoor"&&d.location!=="outdoor")throw new Error(`${m}.location muss indoor oder outdoor sein.`);_(d.width_m,`${m}.width_m`,!0),d.measurements!==void 0&&si(d.measurements,`${m}.measurements`)}),Ie(e.notes,"building.notes").forEach((d,p)=>P(d,`building.notes[${p}]`))}function te(){return{type:"custom:hausklima-card",title:"HausKlima",show_dimensions:!0,show_room_names:!0}}function A(o){let e=x(o,"Konfiguration");if(e.type!=="custom:hausklima-card")throw new Error("type muss custom:hausklima-card sein.");if(e.title!==void 0&&typeof e.title!="string")throw new Error("title muss eine Zeichenfolge sein.");return e.show_dimensions!==void 0&&W(e.show_dimensions,"show_dimensions"),e.show_room_names!==void 0&&W(e.show_room_names,"show_room_names"),e.building!==void 0&&ri(e.building),structuredClone({...te(),...e})}function w(o){return o.building?structuredClone(o.building):vt()}var $e=b(()=>{"use strict";yt();fe()});function Oe(o){switch(o){case"missing":return"Entit\xE4t fehlt";case"unknown":return"Unbekannt";case"unavailable":return"Nicht verf\xFCgbar";case"available":return"Verf\xFCgbar"}}function ie(o,e){if(o.status!=="available"||o.value===null)return Oe(o.status);let t=o.value;if(t.trim()===""||!Number.isFinite(Number(t)))return t;let i=e?.locale?.number_format;if(i==="none")return t;let s=i==="comma_decimal"?"en-US":i==="decimal_comma"?"de-DE":i==="space_comma"?"fr-FR":i==="system"?void 0:e?.locale?.language??e?.language??"de-DE";try{let r=t.replace(/[eE].*$/,"").replace(/[^0-9]/g,"").replace(/^0+/,"").length,n=Number(t);if(r>15||/[eE]/.test(t)||n!==0&&Math.abs(n)<1e-20){let a=new Intl.NumberFormat(s).formatToParts(1.1).find(l=>l.type==="decimal")?.value??".";return t.replace(".",a)}return new Intl.NumberFormat(s,{maximumFractionDigits:20,useGrouping:!1}).format(n)}catch{return t}}function li(o,e,t){let i=t?.states[o.entity],s=i?i.state==="unavailable"?"unavailable":i.state==="unknown"?"unknown":"available":"missing",r=i?.attributes.friendly_name,n=i?.attributes.unit_of_measurement;return{entity:o.entity,name:o.name??(typeof r=="string"?r:o.entity),value:s==="available"?i.state:null,unit:typeof n=="string"?n:"",status:s,is_primary:o.entity===e}}function N(o,e,t="visible"){return j.flatMap(i=>{let s=o.measurements?.[i];if(!s||s.sensors.length===0)return[];let r=s.visible!==!1,n=s.show_in_overview??(i==="temperature"||i==="relative_humidity");if(t!=="details"&&(!r||t==="overview"&&!n))return[];let a=s.primary??s.sensors[0].entity,l=s.sensors.map(c=>li(c,a,e)),h=l.find(c=>c.is_primary)??l[0];return[{type:i,label:Be[i],primary:h,sensors:l,visible:r,show_in_overview:n,...s.position?{position:s.position}:{}}]})}var Be,Ue=b(()=>{"use strict";fe();Be={temperature:"Temperatur",relative_humidity:"Relative Luftfeuchtigkeit",absolute_humidity:"Absolute Luftfeuchtigkeit",co2:"CO\u2082",voc:"VOC"}});var I,ye,V,Ke=b(()=>{/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */I={ATTRIBUTE:1,CHILD:2,PROPERTY:3,BOOLEAN_ATTRIBUTE:4,EVENT:5,ELEMENT:6},ye=o=>(...e)=>({_$litDirective$:o,values:e}),V=class{constructor(e){}get _$AU(){return this._$AM._$AU}_$AT(e,t,i){this._$Ct=e,this._$AM=t,this._$Ci=i}_$AS(e,t){return this.update(e,t)}update(e,t){return this.render(...t)}}});var ji,kt,di,_e,Ge=b(()=>{D();/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */({I:ji}=gt),kt=o=>o.strings===void 0,di={},_e=(o,e=di)=>o._$AH=e});var S,Ct=b(()=>{D();Ke();Ge();/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */S=ye(class extends V{constructor(o){if(super(o),o.type!==I.PROPERTY&&o.type!==I.ATTRIBUTE&&o.type!==I.BOOLEAN_ATTRIBUTE)throw Error("The `live` directive is not allowed on child or event bindings");if(!kt(o))throw Error("`live` bindings can only contain a single expression")}render(o){return o}update(o,[e]){if(e===y||e===u)return e;let t=o.element,i=o.name;if(o.type===I.PROPERTY){if(e===t[i])return y}else if(o.type===I.BOOLEAN_ATTRIBUTE){if(!!e===t.hasAttribute(i))return y}else if(o.type===I.ATTRIBUTE&&t.getAttribute(i)===e+"")return y;return _e(o),e}})});var Et=b(()=>{Ct()});var je,St=b(()=>{D();Ke();Ge();/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */je=ye(class extends V{constructor(){super(...arguments),this.key=u}render(o,e){return this.key=o,e}update(o,[e,t]){return e!==this.key&&(_e(o),this.key=e),t}})});var At=b(()=>{St()});function B(o,e){let t=A(o),i=w(t);return e(i),A({...t,building:i})}function Z(o,e){let t=o.rooms.find(i=>i.id===e);if(!t)throw new Error("Der ausgew\xE4hlte Raum existiert nicht mehr.");return t}function xe(o,e){return o.measurements??={},o.measurements[e]??={sensors:[]},o.measurements[e]}function Rt(o){let e=o.trim();if(!e)throw new Error("Bitte einen Namen eingeben.");return e}function Mt(o,e,t){return B(o,i=>{let s=Z(i,e);Object.assign(s,structuredClone(t)),t.name!==void 0&&(s.name=Rt(t.name)),s.location==="outdoor"&&(s.visible=!1)})}function Tt(o,e){return B(o,t=>{let i=Rt(e.name);if(t.rooms.some(a=>a.name.trim().toLocaleLowerCase()===i.toLocaleLowerCase()))throw new Error("Ein Raum oder Messort mit diesem Namen existiert bereits.");let s=e.level_id?t.levels.find(a=>a.id===e.level_id):t.levels.find(a=>a.id==="ground_floor"&&a.building_id==="house")??t.levels.find(a=>a.building_id==="house");if(!s||s.building_id!=="house")throw new Error("F\xFCr weitere R\xE4ume eine vorhandene Hausebene ausw\xE4hlen. Die Garage ist bereits ein eigener Messort.");let r=e.location==="outdoor"?"outdoor":"room",n=1;for(;t.rooms.some(a=>a.id===`${r}_${n}`);)n++;t.rooms.push({id:`${r}_${n}`,name:i,level_id:s.id,location:e.location,visible:!1,width_m:null})})}function Ht(o,e){return B(o,t=>{Z(t,e),t.rooms=t.rooms.filter(i=>i.id!==e)})}function we(o,e,t,i){return B(o,s=>{let r=xe(Z(s,e),t);Object.assign(r,structuredClone(i)),i.sensors&&i.primary===void 0&&r.primary&&!r.sensors.some(n=>n.entity===r.primary)&&(r.sensors.length?r.primary=r.sensors[0].entity:delete r.primary)})}function zt(o,e,t,i){return B(o,s=>{let r=xe(Z(s,e),t);r.sensors.push({entity:i}),r.primary??=i})}function We(o,e,t,i,s){return B(o,r=>{let n=xe(Z(r,e),t),a=n.sensors.find(l=>l.entity===i);if(!a)throw new Error("Der ausgew\xE4hlte Sensor existiert nicht mehr.");if(Object.assign(a,structuredClone(s)),s.name!==void 0){let l=s.name.trim();l?a.name=l:delete a.name}n.primary===i&&s.entity!==void 0&&(n.primary=s.entity)})}function Ve(o,e,t,i){return B(o,s=>{let r=xe(Z(s,e),t);if(!r.sensors.some(a=>a.entity===i))throw new Error("Der ausgew\xE4hlte Sensor existiert nicht mehr.");let n=r.primary??r.sensors[0]?.entity;r.sensors=r.sensors.filter(a=>a.entity!==i),n===i&&(r.sensors.length?r.primary=r.sensors[0].entity:delete r.primary)})}function Lt(o,e,t,i){return we(o,e,t,{primary:i})}var Dt=b(()=>{"use strict";$e()});var Pt,Nt=b(()=>{"use strict";G();Pt=R`
  :host { display: block; color: var(--primary-text-color, #293d42); font-family: var(--paper-font-body1_-_font-family, inherit); }
  * { box-sizing: border-box; }
  .editor { display: grid; gap: 22px; padding: 4px 0 20px; }
  section { min-width: 0; }
  .base-settings { display: grid; gap: 12px; padding-bottom: 18px; border-bottom: 1px solid var(--divider-color, #dce4e5); }
  .field { display: grid; gap: 8px; font-size: 13px; font-weight: 500; min-width: 0; }
  .field small { font-size: 11px; color: var(--secondary-text-color, #687b81); font-weight: 400; }
  input[type='text'], select { width: 100%; min-width: 0; min-height: 46px; border: 1px solid var(--divider-color, #dce4e5); border-radius: 9px; padding: 10px 12px; background: var(--input-fill-color, var(--card-background-color, #fff)); color: inherit; font: inherit; }
  button, input, select { font: inherit; }
  button { min-height: 44px; border: 1px solid var(--divider-color, #dce4e5); border-radius: 9px; padding: 9px 13px; background: var(--card-background-color, #fff); color: inherit; cursor: pointer; }
  input:focus-visible, button:focus-visible, select:focus-visible, summary:focus-visible { outline: 2px solid var(--primary-color, #2b8279); outline-offset: 3px; }
  .base-options, .measurement-options { display: flex; flex-wrap: wrap; gap: 4px 20px; }
  .measurement-options { margin-top: 8px; }
  .check-label, .radio-label { display: flex; gap: 9px; align-items: center; min-height: 44px; font-size: 13px; font-weight: 400; cursor: pointer; }
  input[type='checkbox'], input[type='radio'] { width: 21px; height: 21px; flex-shrink: 0; margin: 0; accent-color: var(--primary-color, #2b8279); }
  .section-heading { display: flex; gap: 10px; align-items: center; margin-bottom: 16px; }
  .step { display: grid; place-items: center; width: 27px; height: 27px; border-radius: 50%; background: var(--secondary-background-color, #eef3f1); color: var(--primary-color, #2b8279); font-size: 12px; font-weight: 650; flex-shrink: 0; }
  h2 { margin: 0; font-size: 16px; font-weight: 600; }
  .room-name-row { display: flex; gap: 12px; align-items: end; margin-top: 16px; }
  .room-name-row .field { flex: 1; }
  .hint, .empty-hint, .selector-note { color: var(--secondary-text-color, #687b81); font-size: 12px; line-height: 1.6; margin: 10px 0 0; overflow-wrap: anywhere; }
  .empty-hint { border-radius: 10px; padding: 16px; background: var(--secondary-background-color, #f1f5f4); margin-top: 14px; }
  .metric-heading { margin-top: 26px; }
  .text-button { background: transparent; border-color: transparent; padding-left: 8px; padding-right: 8px; font-size: 12px; }
  .danger { color: var(--error-color, #b04336); }
  .sensor-list { display: grid; gap: 12px; margin-top: 16px; }
  .sensor-entry { display: grid; gap: 12px; border: 1px solid var(--divider-color, #dce4e5); border-radius: 12px; padding: 14px; min-width: 0; }
  .sensor-topline { display: flex; justify-content: space-between; gap: 12px; font-size: 12px; font-weight: 600; }
  .sensor-status { font-weight: 400; color: var(--secondary-text-color, #687b81); }
  .sensor-actions { display: flex; justify-content: space-between; gap: 12px; }
  ha-selector { display: block; min-width: 0; width: 100%; }
  .add-sensor { margin-top: 16px; }
  .confirmation, .error { border: 1px solid color-mix(in srgb, var(--error-color, #b04336) 35%, transparent); border-radius: 10px; background: color-mix(in srgb, var(--error-color, #b04336) 6%, var(--card-background-color, #fff)); padding: 14px; font-size: 13px; line-height: 1.6; margin-top: 12px; }
  .confirmation p { margin: 7px 0 12px; color: var(--secondary-text-color, #687b81); font-size: 12px; }
  .button-row { display: flex; flex-wrap: wrap; gap: 8px; }
  .error { margin: 0; color: var(--error-color, #b04336); }
  .new-room-settings { border-top: 1px solid var(--divider-color, #dce4e5); padding-top: 18px; }
  summary { min-height: 44px; display: list-item; cursor: pointer; font-size: 14px; font-weight: 600; line-height: 44px; }
  .new-room-settings .field { margin-top: 14px; }
  .primary-button { background: var(--primary-color, #2b8279); color: var(--text-primary-color, #fff); border-color: transparent; margin-top: 18px; }
  @media (max-width: 420px) {
    .room-name-row { align-items: stretch; flex-direction: column; gap: 4px; }
    .room-name-row .text-button { align-self: flex-start; }
    .sensor-entry { padding: 12px; }
  }
`});var It={};jt(It,{HausKlimaCardEditor:()=>ke});var ke,Bt=b(()=>{"use strict";G();Et();At();$e();Dt();Ue();fe();Nt();ke=class extends k{constructor(){super(...arguments);this._config=te();this._roomId="workshop";this._metric="temperature";this._error="";this._confirmDelete=!1;this._newRoomName="";this._newRoomKind="indoor";this._newRoomLevel="ground_floor";this._selectorAvailable=!!customElements.get("ha-selector");this._selectorLoading=!1;this._selectorRevision=0}static{this.properties={hass:{attribute:!1},_config:{state:!0},_roomId:{state:!0},_metric:{state:!0},_error:{state:!0},_confirmDelete:{state:!0},_newRoomName:{state:!0},_newRoomKind:{state:!0},_newRoomLevel:{state:!0},_selectorAvailable:{state:!0},_selectorLoading:{state:!0},_selectorRevision:{state:!0}}}setConfig(t){this._config=A(t);let i=w(this._config).rooms;i.some(s=>s.id===this._roomId)||(this._roomId=i[0]?.id??""),this._confirmDelete=!1,this._error=""}connectedCallback(){super.connectedCallback(),this.ensureNativeSelector()}async ensureNativeSelector(){if(customElements.get("ha-selector")){this._selectorAvailable=!0;return}if(!this._selectorLoading){this._selectorLoading=!0;try{await(await window.loadCardHelpers?.())?.createCardElement({type:"button"})?.constructor?.getConfigElement?.(),this._selectorAvailable=!!customElements.get("ha-selector")}catch{this._selectorAvailable=!1}finally{this._selectorLoading=!1}}}updated(){let t=this.shadowRoot?.querySelector("#room-select");t&&t.value!==this._roomId&&(t.value=this._roomId);let i=this.shadowRoot?.querySelector("#metric-select");i&&i.value!==this._metric&&(i.value=this._metric);let s=this.shadowRoot?.querySelector("#new-room-level");s&&[...s.options].some(r=>r.value===this._newRoomLevel)&&(s.value=this._newRoomLevel)}commit(t){this._config=A(t),this._error="",this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:structuredClone(this._config)},bubbles:!0,composed:!0}))}apply(t){try{this.commit(t())}catch(i){this._error=i instanceof Error?i.message:"Die \xC4nderung konnte nicht \xFCbernommen werden."}}updateBase(t,i){this.apply(()=>({...this._config,[t]:i}))}changeRoom(t){this._roomId=t.target.value,this._confirmDelete=!1,this._error=""}changeMetric(t){this._metric=t.target.value,this._error=""}addLocation(){let t=w(this._config),i=new Set(t.rooms.map(r=>r.id)),s=t.levels.find(r=>r.id===this._newRoomLevel&&r.building_id==="house")??t.levels.find(r=>r.building_id==="house");this.apply(()=>Tt(this._config,{name:this._newRoomName,location:this._newRoomKind,...this._newRoomKind==="indoor"?{level_id:s?.id}:{}})),!this._error&&(this._roomId=w(this._config).rooms.find(r=>!i.has(r.id))?.id??this._roomId,this._newRoomName="",this._confirmDelete=!1)}deleteLocation(t){this.apply(()=>Ht(this._config,t.id)),!this._error&&(this._roomId=w(this._config).rooms[0]?.id??"",this._confirmDelete=!1)}sensorChanged(t,i,s){t.stopPropagation();let r=t.detail?.value;if(typeof r!="string"||!r.trim()){s&&this.apply(()=>Ve(this._config,i.id,this._metric,s.entity));return}s?.entity!==r&&(this.apply(()=>s?We(this._config,i.id,this._metric,s.entity,{entity:r}):zt(this._config,i.id,this._metric,r)),(!s||this._error)&&(this._selectorRevision+=1))}renderSensor(t,i,s,r){let n=this.hass?.states[i.entity],a=n?n.state==="unavailable"?"Nicht verf\xFCgbar":n.state==="unknown"?"Unbekannt":"Verf\xFCgbar":"Entit\xE4t fehlt";return g`
      <div class="sensor-entry" data-sensor-row=${i.entity}>
        <div class="sensor-topline"><span>Sensor ${s+1}</span><span class="sensor-status">${a}</span></div>
        ${je(`${t.id}:${this._metric}:${i.entity}:${this._selectorRevision}`,g`<ha-selector
          data-sensor-entity=${i.entity}
          .hass=${this.hass}
          .selector=${{entity:{filter:{domain:"sensor"}}}}
          .value=${i.entity}
          .label=${`Sensor ${s+1} ausw\xE4hlen`}
          .required=${!1}
          .disabled=${!this._selectorAvailable}
          @value-changed=${l=>this.sensorChanged(l,t,i)}
        ></ha-selector>`)}
        <label class="field"><span>Anzeigename <small>(optional)</small></span>
          <input type="text" data-action="sensor-name" data-entity=${i.entity}
            aria-label=${`Anzeigename f\xFCr Sensor ${s+1}`} .value=${S(i.name??"")}
            placeholder="Name der HA-Entität verwenden"
            @change=${l=>this.apply(()=>We(this._config,t.id,this._metric,i.entity,{name:l.target.value}))} />
        </label>
        <div class="sensor-actions">
          <label class="radio-label"><input type="radio" name="primary-sensor"
            data-action="sensor-primary" data-entity=${i.entity}
            .checked=${(r??t.measurements?.[this._metric]?.sensors[0]?.entity)===i.entity}
            @change=${()=>this.apply(()=>Lt(this._config,t.id,this._metric,i.entity))} /> Hauptsensor</label>
          <button type="button" class="text-button danger" data-action="remove-sensor" data-entity=${i.entity}
            aria-label=${`Sensor ${s+1} entfernen`}
            @click=${()=>this.apply(()=>Ve(this._config,t.id,this._metric,i.entity))}>Entfernen</button>
        </div>
      </div>
    `}render(){let t=w(this._config),i=t.rooms.find(a=>a.id===this._roomId),s=i?.measurements?.[this._metric],r=t.levels.filter(a=>a.building_id==="house"),n=s?.show_in_overview??(this._metric==="temperature"||this._metric==="relative_humidity");return g`
      <div class="editor">
        <section class="base-settings" aria-label="Darstellung">
          <label class="field" for="title"><span>Kartentitel</span>
            <input id="title" type="text" .value=${S(this._config.title??"")}
              @change=${a=>this.updateBase("title",a.target.value)} />
          </label>
          <div class="base-options">
            <label class="check-label"><input id="show-room-names" type="checkbox" .checked=${this._config.show_room_names??!0}
              @change=${a=>this.updateBase("show_room_names",a.target.checked)} /> Raumnamen anzeigen</label>
            <label class="check-label"><input id="show-dimensions" type="checkbox" .checked=${this._config.show_dimensions??!1}
              @change=${a=>this.updateBase("show_dimensions",a.target.checked)} /> Technische Maße anzeigen</label>
          </div>
        </section>

        <section class="room-settings" aria-label="Räume und Sensoren">
          <div class="section-heading"><span class="step">1</span><h2>Raum oder Messort</h2></div>
          <label class="field" for="room-select"><span>Raum auswählen</span>
            <select id="room-select" .value=${S(this._roomId)} @change=${this.changeRoom}>
              ${t.rooms.map(a=>g`<option value=${a.id} .selected=${a.id===this._roomId}>${a.name}${a.location==="outdoor"?" \xB7 Au\xDFen":""}</option>`)}
            </select>
          </label>
          ${i?g`
            <div class="room-name-row">
              <label class="field" for="room-name"><span>Anzeigename des Raums</span>
                <input id="room-name" type="text" .value=${S(i.name)}
                  @change=${a=>this.apply(()=>Mt(this._config,i.id,{name:a.target.value}))} />
              </label>
              <button id="delete-room" type="button" class="text-button danger" @click=${()=>{this._confirmDelete=!0}}>Raum entfernen</button>
            </div>
            <p class="hint">${i.location==="outdoor"?"Au\xDFenmessort \xB7 eigener Bereich au\xDFerhalb des Hauses.":`${t.levels.find(a=>a.id===i.level_id)?.name??"Weiterer Raum"} \xB7 ${i.visible?"im Geb\xE4udeschnitt vorgesehen":"in der separaten Raum\xFCbersicht"}.`}</p>
            ${this._confirmDelete?g`
              <div class="confirmation" role="alert">
                <strong>„${i.name}“ mit allen Sensorzuordnungen entfernen?</strong>
                <p>Die anderen Räume und ihre Sensoren bleiben erhalten.</p>
                <div class="button-row"><button id="cancel-delete-room" type="button" @click=${()=>{this._confirmDelete=!1}}>Abbrechen</button>
                  <button id="confirm-delete-room" type="button" class="danger" @click=${()=>this.deleteLocation(i)}>Entfernen bestätigen</button></div>
              </div>
            `:u}

            <div class="section-heading metric-heading"><span class="step">2</span><h2>Messwerte zuordnen</h2></div>
            <label class="field" for="metric-select"><span>Messart</span>
              <select id="metric-select" .value=${S(this._metric)} @change=${this.changeMetric}>
                ${j.map(a=>g`<option value=${a} .selected=${a===this._metric}>${Be[a]}</option>`)}
              </select>
            </label>
            <div class="measurement-options">
              <label class="check-label"><input id="metric-visible" type="checkbox" .checked=${s?.visible!==!1}
                @change=${a=>this.apply(()=>we(this._config,i.id,this._metric,{visible:a.target.checked}))} /> Messart in Übersichten aktiv</label>
              <label class="check-label"><input id="metric-overview" type="checkbox" .checked=${n}
                @change=${a=>this.apply(()=>we(this._config,i.id,this._metric,{show_in_overview:a.target.checked}))} /> Hauptwert im Raum anzeigen</label>
            </div>
            <p class="hint">Alle zugeordneten Sensoren bleiben in den Raumdetails erreichbar, auch bei ausgeblendeter Hauptanzeige.</p>
            <div class="sensor-list">${s?.sensors.map((a,l)=>this.renderSensor(i,a,l,s.primary))}</div>
            ${s?.sensors.length?u:g`<p class="empty-hint">Noch kein Sensor für diese Messart zugeordnet.</p>`}
            ${this._selectorAvailable?g`
              <div class="add-sensor" data-picker-revision=${this._selectorRevision}>
                ${je(this._selectorRevision,g`<ha-selector id="new-sensor" .hass=${this.hass}
                  .selector=${{entity:{filter:{domain:"sensor"}}}}
                  .value=${void 0} .label=${s?.sensors.length?"Weiteren Sensor ausw\xE4hlen":"Sensor ausw\xE4hlen"}
                  .required=${!1}
                  @value-changed=${a=>this.sensorChanged(a,i)}
                ></ha-selector>`)}
              </div>
            `:g`
              <div class="selector-note" role="status">${this._selectorLoading?"Home-Assistant-Entit\xE4tsauswahl wird geladen \u2026":"Die native Entit\xE4tsauswahl steht im Home-Assistant-Karteneditor zur Verf\xFCgung."}
                ${this._selectorLoading?u:g`<button type="button" class="text-button" @click=${()=>this.ensureNativeSelector()}>Erneut versuchen</button>`}
              </div>
            `}
          `:g`<p class="empty-hint">Füge einen Raum oder Außenmessort hinzu.</p>`}
        </section>

        ${this._error?g`<div class="error" role="alert">${this._error}</div>`:u}

        <details class="new-room-settings">
          <summary>Raum oder Außenmessort hinzufügen</summary>
          <p class="hint">Zusätzliche Räume erscheinen in der separaten Übersicht. Hausmaße und vorhandene Garage werden nicht dupliziert oder verändert.</p>
          <label class="field" for="new-room-kind"><span>Art des Messorts</span>
            <select id="new-room-kind" .value=${S(this._newRoomKind)}
              @change=${a=>{this._newRoomKind=a.target.value}}>
              <option value="indoor" .selected=${this._newRoomKind==="indoor"}>Weiterer Raum</option><option value="outdoor" .selected=${this._newRoomKind==="outdoor"}>Außenmessort</option>
            </select>
          </label>
          <label class="field" for="new-room-name"><span>Name</span>
            <input id="new-room-name" type="text" .value=${S(this._newRoomName)}
              @input=${a=>{this._newRoomName=a.target.value}} />
          </label>
          ${this._newRoomKind==="indoor"?g`
            <label class="field" for="new-room-level"><span>Gebäudeebene</span>
              <select id="new-room-level" .value=${S(r.some(a=>a.id===this._newRoomLevel)?this._newRoomLevel:r[0]?.id??"")}
                @change=${a=>{this._newRoomLevel=a.target.value}}>
                ${r.map(a=>g`<option value=${a.id} .selected=${a.id===(r.some(l=>l.id===this._newRoomLevel)?this._newRoomLevel:r[0]?.id)}>${a.name}</option>`)}
              </select>
            </label>
          `:u}
          <button id="add-room" type="button" class="primary-button" @click=${this.addLocation}>Messort hinzufügen</button>
        </details>
      </div>
    `}static{this.styles=Pt}};customElements.get("hausklima-card-editor")||customElements.define("hausklima-card-editor",ke)});G();$e();G();function be(o){let s=o.roof.interior_ridge_height_m*40,r=(o.levels.find($=>$.id==="ground_floor")?.clear_height_m??0)*40,n=(o.levels.find($=>$.id==="basement")?.clear_height_m??0)*40,a=86+s,l=a+r,h=l+n,c=o.house.width_m*40,d=94+c+o.garage.gap_m*40,p=o.garage.width_m*40,m=o.garage.height_m*40,v=o.layers[0]?.id,se=[],Ot=[{id:"attic",name:"DG",y:86,height:s,building:"house",width:c,x:94},{id:"ground_floor",name:"EG",y:a,height:r,building:"house",width:c,x:94},{id:"basement",name:"KG",y:l,height:n,building:"house",width:c,x:94},{id:"garage",name:"",y:l-m,height:m,building:"garage",width:p,x:d}].map($=>{let F=0;for(let Qe of o.rooms.filter(U=>U.level_id===$.id&&U.location!=="outdoor"&&U.visible&&(!U.layer_id||U.layer_id===v))){if(o.levels.find(Kt=>Kt.id===$.id)?.building_id!==$.building)break;let oe=(Qe.width_m??0)*40;if(oe<=0||F+oe>$.width+.001||$.height===0)break;se.push({room:Qe,x:$.x+F,y:$.y,width:oe,height:$.height,level:$.id}),F+=oe}return{...$,remaining:$.width-F,filled:F}}),Ye=Math.min(0,l-m-64),Ut=new Set(se.map($=>$.room.id));return{x:94,roofTop:86,atticHeight:s,groundTop:a,groundY:l,basementBottom:h,houseWidth:c,garageX:d,garageWidth:p,garageHeight:m,shapes:se,bands:Ot,otherRooms:o.rooms.filter($=>!Ut.has($.id)),minY:Ye,width:d+p+64,height:Math.max(h,l)+80-Ye}}var ve=o=>`${o.toLocaleString("de-DE",{maximumFractionDigits:2})} m`;function ni(o){let{x:e,y:t,width:i,height:s,room:r}=o,n=t+s-13,a=Math.min(i/130,1),l=e+10,h=e+i-10;switch(r.id){case"bedroom":return f`<g class="scene-furniture bedroom-furniture">
        <ellipse cx=${l+83} cy=${n+1} rx="83" ry="9" fill="#6e5534" opacity=".13"/>
        <rect x=${l+7} y=${n-32} width="149" height="30" rx="5" fill="#b38f67"/>
        <path d="M ${l+12} ${n-32} h 138 l -13 -10 h -120 Z" fill="#e8d9bc"/>
        <rect x=${l+13} y=${n-40} width="131" height="26" rx="5" fill="#f4e8d2"/>
        <rect x=${l+16} y=${n-38} width="40" height="15" rx="6" fill="#fff6e7"/>
        <path d="M ${l+58} ${n-37} h 81 v 22 h -81Z" fill="#c4af8e"/>
        <path d="M ${l+67} ${n-37} v 22 m 12 -22 v 22" stroke="#d8c8ad" stroke-width="1"/>
        <rect x=${l+161} y=${n-28} width="25" height="25" rx="2" fill="#b69c77"/>
        <path d="M ${l+173} ${n-47} v 18" stroke="#8f7a5c" stroke-width="2"/>
        <path d="M ${l+164} ${n-46} h 18 l -3 -12 h -12Z" fill="#ffedb9"/>
      </g>`;case"storage":return f`<g class="scene-furniture">
        <rect x=${h-42} y=${n-79} width="37" height="78" rx="1" fill="#b59672"/>
        <rect x=${h-39} y=${n-76} width="31" height="72" fill="#d0b48a"/>
        ${[0,1,2].map(c=>f`<g>
          <rect x=${h-36} y=${n-69+c*24} width="12" height="17" rx="1" fill=${c===1?"#a9b5a1":"#ece0c7"}/>
          <rect x=${h-22} y=${n-64+c*24} width="12" height="12" rx="1" fill=${c===1?"#ddc59e":"#b9bca5"}/>
          <path d="M ${h-39} ${n-50+c*24} h 31" stroke="#947b5c" stroke-width="3"/>
        </g>`)}
        <rect x=${l+5} y=${n-17} width="30" height="16" rx="2" fill="#c4b18d"/>
        <path d="M ${l+18} ${n-16} v 14" stroke="#e8d5b4" stroke-width="2"/>
      </g>`;case"living_room":return f`<g class="scene-furniture">
        <ellipse cx=${l+99} cy=${n+1} rx="93" ry="11" fill="#aa9270" opacity=".2"/>
        <rect x=${l+14} y=${n-31} width="114" height="29" rx="6" fill="#b29c7c"/>
        <rect x=${l+17} y=${n-38} width="107" height="21" rx="6" fill="#c9b79a"/>
        <path d="M ${l+51} ${n-35} v 16 m 35 -16 v 16" stroke="#e5d7bf" stroke-width="2"/>
        <rect x=${l+8} y=${n-26} width="14" height="21" rx="5" fill="#baa486"/>
        <rect x=${l+120} y=${n-26} width="14" height="21" rx="5" fill="#baa486"/>
        <path d="M ${l+22} ${n-1} v 5 m 99 -5 v 5" stroke="#7e6a52" stroke-width="3"/>
        <ellipse cx=${h-39} cy=${n-12} rx="25" ry="6" fill="#cfb58e"/>
        <path d="M ${h-55} ${n-9} v 10 m 31 -10 v 10" stroke="#a68c68" stroke-width="3"/>
        <path d="M ${h-17} ${n-2} l -4 -15 h 14 l -3 15Z" fill="#bcac8c"/>
        <path d="M ${h-14} ${n-17} v -27" stroke="#81976b" stroke-width="2"/>
        <ellipse cx=${h-20} cy=${n-36} rx="5" ry="10" transform="rotate(-32 ${h-20} ${n-36})" fill="#8b9f76"/>
        <ellipse cx=${h-9} cy=${n-44} rx="5" ry="10" transform="rotate(30 ${h-9} ${n-44})" fill="#9dac88"/>
      </g>`;case"kitchen":return f`<g class="scene-furniture">
        <rect x=${l+3} y=${n-33} width=${Math.max(10,i-27)} height="32" rx="2" fill="#c5b28f"/>
        <path d="M ${l+1} ${n-33} h ${Math.max(10,i-23)} l -6 -6 h -${Math.max(5,i-29)}Z" fill="#f4ecdb"/>
        <path d="M ${l+25} ${n-30} v 28 m 35 -28 v 28 m 35 -28 v 28" stroke="#e4d5b9" stroke-width="1.5"/>
        <ellipse cx=${l+32} cy=${n-37} rx="13" ry="3" fill="#a9b5af"/>
        <path d="M ${l+32} ${n-38} v -9 q 0 -6 6 -4" fill="none" stroke="#9aa79e" stroke-width="2"/>
        <path d="M ${h-29} ${n-42} h 17" stroke="#55625a" stroke-width="3"/>
        <path d="M ${h-25} ${n-46} h 8" stroke="#56615b" stroke-width="3"/>
      </g>`;case"workshop":return f`<g class="scene-furniture" transform="translate(${l+3} ${n}) scale(${a})">
        <rect x="0" y="-40" width="87" height="37" rx="2" fill="#638c92"/>
        <path d="M -3 -40 h 95 l -4 -6 h -85Z" fill="#c7ba9e"/>
        <path d="M 6 -29 h 74 m -74 11 h 74" stroke="#adcbca" stroke-width="1.4"/>
        <path d="M 38 -39 v 34" stroke="#8aafad" stroke-width="1.5"/>
        <path d="M 11 -24 h 16 m 19 0 h 17 m -52 11 h 16 m 19 0 h 17" stroke="#d1dbce" stroke-width="1.5"/>
        <rect x="3" y="-69" width="77" height="22" rx="1" fill="#a0b4aa"/>
        ${[0,1,2,3,4].map(c=>f`<path d="M ${12+c*13} -64 v 11" stroke="#647e77" stroke-width=${c%2?3:2}/>`)}
      </g>`;case"laundry":return f`<g class="scene-furniture">
        <rect x=${h-40} y=${n-46} width="36" height="44" rx="3" fill="#e4e9de" stroke="#849e98" stroke-width="1.4"/>
        <path d="M ${h-37} ${n-38} h 30" stroke="#b0c0b5"/>
        <circle cx=${h-22} cy=${n-22} r="12" fill="#9bb6b6"/>
        <circle cx=${h-22} cy=${n-22} r="8" fill="#607e85"/>
        <circle cx=${h-10} cy=${n-42} r="1.4" fill="#8da49b"/>
        <rect x=${l+5} y=${n-12} width="29" height="11" rx="3" fill="#a8af96"/>
        <path d="M ${l+8} ${n-13} h 23 m -21 -3 h 19" stroke="#e7ddc7" stroke-width="3"/>
      </g>`;case"basement_hall":return f`<g class="scene-furniture">
        <path d="M ${h-65} ${n} v -7 h 10 v -7 h 10 v -7 h 10 v -7 h 10 v -7 h 10 v -7 h 10 v 42Z" fill="#9daea0"/>
        <path d="M ${h-67} ${n-8} l 64 -43" stroke="#c8d2bb" stroke-width="2" fill="none"/>
        <rect x=${l+4} y=${n-45} width="20" height="44" fill="#a8b5a1"/>
        <path d="M ${l+6} ${n-43} h 16 v 42" fill="none" stroke="#c5ceb7" stroke-width="2"/>
      </g>`;default:return f`<g class="scene-furniture">
        ${i<70?f`<path d="M ${e+i/2-9} ${n} v -45 q 9 -10 18 0 v 45" fill="#bcaa8a" stroke="#d4c6aa" stroke-width="2"/>`:f`<path d="M ${l+5} ${n} v -42 h 25 v 42" fill="#c9b99b" opacity=".7"/>`}
      </g>`}}function ai(o,e,t){let{x:i,y:s,width:r,height:n,room:a,level:l}=o,h=`${t.idPrefix}-room-${e}`,c=t.selected===a.id,d=r<70;return f`
    <g class="room ${l}${c?" selected":""}" data-room-id=${a.id}
      role="button" tabindex="0" aria-label=${a.name} aria-pressed=${String(c)}
      @click=${()=>t.onSelect(a)}
      @keydown=${p=>{(p.key==="Enter"||p.key===" ")&&(p.preventDefault(),t.onSelect(a))}}>
      <title>${a.name} · Raumdetails öffnen</title>
      <defs><clipPath id=${h}><rect x=${i+1} y=${s+1} width=${Math.max(0,r-2)} height=${Math.max(0,n-2)}/></clipPath></defs>
      <rect class="room-fill" x=${i} y=${s} width=${r} height=${n}
        fill="url(#${t.idPrefix}-wall-${l})"/>
      <g class="room-decoration" clip-path="url(#${h})" aria-hidden="true">
        <path d="M ${i+1} ${s+n-18} h ${r-2} v 17 h -${r-2}Z" fill="url(#${t.idPrefix}-floor-${l})"/>
        <path d="M ${i+1} ${s+n-18} h ${r-2} l -12 -7 h -${Math.max(0,r-14)}Z" fill="#a78b63" opacity=".17"/>
        <rect x=${i+1} y=${s+1} width=${Math.max(0,r-2)} height="5" fill="#fff6dd" opacity=".55"/>
        <path d="M ${i+r-7} ${s+5} v ${n-6} h 6 v -${n-6}Z" fill="#8c795a" opacity=".1"/>
        <rect x=${i+1} y=${s+5} width=${Math.max(0,r-2)} height=${Math.max(0,n-23)} fill="url(#${t.idPrefix}-sunlight)"/>
        ${!d&&a.id!=="storage"?f`<g class="window-light">
          <rect x=${i+13} y=${s+29} width="23" height="28" rx="1" fill="#ffefd0" opacity=".6"/>
          <path d="M ${i+13} ${s+43} h 23 m -12 -14 v 28" stroke="#f6e0b3" stroke-width="2"/>
          <path d="M ${i+13} ${s+57} h 23 l 34 27 h -24Z" fill="#fff0c9" opacity=".12"/>
        </g>`:u}
        ${ni(o)}
      </g>
      ${t.showNames?f`<text class="room-name${d?" narrow-room-name":""}"
        text-anchor="middle" x=${i+r/2} y=${d?s+n/2:s+21}
        transform=${d?`rotate(-90 ${i+r/2} ${s+n/2})`:""}>${a.name}</text>`:u}
      <text class="compact-room-number" text-anchor="middle" x=${i+r/2} y=${s+n/2+7}>${String(e+1).padStart(2,"0")}</text>
      ${t.renderMetrics(o)}
      <rect class="room-focus" x=${i+1.5} y=${s+1.5} width=${Math.max(0,r-3)} height=${Math.max(0,n-3)} rx="1"/>
    </g>`}function _t(o,e){let t=be(o),i=t.shapes.filter(m=>m.level!=="garage"),s=t.bands.filter(m=>m.building==="house"&&m.height>0),{x:r,houseWidth:n,roofTop:a,basementBottom:l}=t,h=r+n,c=e.idPrefix,d=n+104,p=l-a+(e.showDimensions?128:100);return f`
    <svg class="building house-scene" viewBox="${r-44} ${a-63} ${d} ${p}"
      xmlns="http://www.w3.org/2000/svg" aria-label="Schematische Traufansicht mit geöffnetem Dachgeschoss, Erdgeschoss und Keller">
      <defs>
        <linearGradient id="${c}-wall-attic" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#f5e4c8"/><stop offset="1" stop-color="#ddbf93"/></linearGradient>
        <linearGradient id="${c}-wall-ground_floor" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#eee0c8"/><stop offset="1" stop-color="#d6bb91"/></linearGradient>
        <linearGradient id="${c}-wall-basement" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#d3dfd5"/><stop offset="1" stop-color="#afc3b9"/></linearGradient>
        <linearGradient id="${c}-floor-attic" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#b6966d"/><stop offset="1" stop-color="#d1b88e"/></linearGradient>
        <linearGradient id="${c}-floor-ground_floor" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#b99d75"/><stop offset="1" stop-color="#dcc8a1"/></linearGradient>
        <linearGradient id="${c}-floor-basement" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#8ca99e"/><stop offset="1" stop-color="#b8c7b5"/></linearGradient>
        <linearGradient id="${c}-side" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#c8b89b"/><stop offset="1" stop-color="#e2d6c1"/></linearGradient>
        <linearGradient id="${c}-roof" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#626b70"/><stop offset=".45" stop-color="#424d55"/><stop offset="1" stop-color="#2e3940"/></linearGradient>
        <radialGradient id="${c}-sunlight" cx=".12" cy=".1" r="1"><stop stop-color="#fff6d6" stop-opacity=".35"/><stop offset="1" stop-color="#fff6d6" stop-opacity="0"/></radialGradient>
        <pattern id="${c}-roof-tiles" width="24" height="11" patternUnits="userSpaceOnUse"><path d="M 0 10.5 h 24 M 12 0 v 10.5 M 0 0 v 10.5" fill="none" stroke="#b9c1c3" stroke-width=".6" opacity=".22"/></pattern>
        <filter id="${c}-shadow" x="-15%" y="-15%" width="140%" height="145%"><feDropShadow dx="3" dy="8" stdDeviation="7" flood-color="#67553a" flood-opacity=".14"/></filter>
      </defs>
      <g class="scene-ground" aria-hidden="true">
        <ellipse cx=${r+n/2+17} cy=${l+14} rx=${n/2+39} ry="13" fill="#7b7967" opacity=".1"/>
        <path d="M ${r-12} ${l+4} h ${n+31} l 30 -12 h -${n+31}Z" fill="#c2c8ac"/>
        <path d="M ${r-12} ${l+4} h ${n+31} v 5 h -${n+31}Z" fill="#a3b28c"/>
        <path d="M ${h+19} ${l+4} l 30 -12 v 5 l -30 12Z" fill="#889b7c"/>
      </g>
      <g class="house-shell" filter="url(#${c}-shadow)" aria-hidden="true">
        <path d="M ${h+4} ${a-1} l 28 -18 v ${l-a+7} l -28 18Z" fill="url(#${c}-side)"/>
        <rect x=${r-5} y=${a-5} width=${n+10} height=${l-a+10} rx="1" fill="#ad9878"/>
        ${s.map(m=>f`<rect class="unresolved-fill" x=${m.x} y=${m.y} width=${m.width} height=${m.height} fill="#d6ceba"/>`)}
      </g>
      ${i.map((m,v)=>ai(m,v,e))}
      <g class="scene-structure" aria-hidden="true">
        ${s.map(m=>f`
          <path d="M ${r-4} ${m.y+m.height} h ${n+10} v 5 h -${n+10}Z" fill="#ae9774"/>
          <path d="M ${h+6} ${m.y+m.height} l 27 -17 v 5 l -27 17Z" fill="#b5a183"/>
          <path d="M ${r-2} ${m.y+m.height-.5} h ${n+7}" stroke="#f5e9cd" stroke-width="1" opacity=".7"/>
          <text class="level-label" text-anchor="end" x=${r-17} y=${m.y+m.height/2+4}>${m.name}</text>
        `)}
        <path class="roof-plane" d="M ${r-17} ${a-4} L ${r+9} ${a-43} H ${h+20} L ${h+42} ${a-4} Z" fill="url(#${c}-roof)"/>
        <path d="M ${r-17} ${a-4} L ${r+9} ${a-43} H ${h+20} L ${h+42} ${a-4} Z" fill="url(#${c}-roof-tiles)"/>
        <path class="ridge" d="M ${r+9} ${a-43} h ${n+11}" fill="none" stroke="#879091" stroke-width="3"/>
        <path d="M ${r-18} ${a-4} h ${n+61} v 5 h -${n+61}Z" fill="#303a40"/>
        <path d="M ${r-10} ${a+1} h ${n+42}" stroke="#e4d5b6" stroke-width="3"/>
        <path d="M ${r-5} ${a+2} v ${l-a+2} m ${n+10} -${l-a+2} v ${l-a+2}" stroke="#b19c7c" stroke-width="5"/>
      </g>
      ${e.showDimensions?f`<g class="scene-dimensions">
        <path class="dimension-line" d="M ${r} ${l+26} v 8 m 0 -4 h ${n} m 0 -4 v 8"/>
        <text class="dimension-label" text-anchor="middle" x=${r+n/2} y=${l+48}>${ve(o.house.width_m)} Traufseite · schematisch</text>
        <text class="dimension-label" text-anchor="middle" x=${r+n/2} y=${a-52}>First innen ${ve(o.roof.interior_ridge_height_m)} · Kniestock ${ve(o.roof.knee_wall_height_m)}</text>
        ${s.filter(m=>m.id!=="attic").map(m=>f`<text class="dimension-label level-height" text-anchor="end" x=${r-17} y=${m.y+m.height/2+18}>${ve(m.height/40)}</text>`)}
      </g>`:u}
    </svg>`}var xt=R`
  .house-scene { display: block; width: 100%; height: auto; overflow: visible; }
  .house-scene text { font-family: inherit; pointer-events: none; }
  .house-scene .room { cursor: pointer; outline: none; -webkit-tap-highlight-color: transparent; }
  .house-scene .room-decoration, .house-scene .scene-structure, .house-scene .scene-ground,
  .house-scene .house-shell { pointer-events: none; }
  .house-scene .room-fill { stroke: #b4a181; stroke-width: 1.3; }
  .house-scene .room-focus { fill: transparent; stroke: transparent; stroke-width: 3; pointer-events: none; }
  .house-scene .room.selected .room-focus, .house-scene .room:focus-visible .room-focus { stroke: var(--hk-accent, #357969); }
  .house-scene .room:hover .room-focus { stroke: color-mix(in srgb, var(--hk-accent, #357969) 60%, transparent); }
  .house-scene .room-name { fill: #443e32; font-size: 12px; font-weight: 650; letter-spacing: -.12px; }
  .house-scene .narrow-room-name { font-size: 11px; }
  .house-scene .compact-room-number { display: none; fill: #4d4639; font-size: 23px; font-weight: 700; }
  .house-scene .level-label { fill: var(--hk-muted, #7a817c); font-size: 10px; font-weight: 600; }
  .house-scene .dimension-label { fill: var(--hk-muted, #7a817c); font-size: 8px; }
  .house-scene .dimension-line { fill: none; stroke: var(--hk-muted, #7a817c); stroke-width: .8; opacity: .6; }
`;Ue();G();var wt=R`
  :host {
    display: block;
    --hk-ink: var(--primary-text-color, #303d34);
    --hk-muted: var(--secondary-text-color, #727d71);
    --hk-line: var(--divider-color, #e2e6db);
    --hk-paper: var(--ha-card-background, var(--card-background-color, #fffdf8));
    --hk-accent: var(--primary-color, #527652);
    --hk-chip: rgba(22, 26, 30, .82);
    color: var(--hk-ink);
    font-family: var(--paper-font-body1_-_font-family, system-ui, sans-serif);
  }
  * { box-sizing: border-box; }
  ha-card {
    display: block;
    container: hausklima / inline-size;
    overflow: clip;
    min-width: 0;
    background: var(--hk-paper);
    border: var(--ha-card-border-width, 1px) solid var(--ha-card-border-color, var(--hk-line));
    border-radius: var(--ha-card-border-radius, 22px);
    box-shadow: var(--ha-card-box-shadow, 0 5px 30px #283b2208);
  }
  button { color: inherit; font: inherit; cursor: pointer; -webkit-tap-highlight-color: transparent; }
  button:focus-visible, summary:focus-visible { outline: 3px solid var(--hk-accent); outline-offset: 3px; }
  button, select, summary { touch-action: manipulation; }
  .card-header { display: flex; justify-content: space-between; align-items: center; gap: 12px; padding: 16px 24px 4px; }
  .card-title { display: flex; gap: 9px; align-items: center; min-width: 0; }
  h1 { margin: 0; font-size: 20px; line-height: 1.3; font-weight: 650; letter-spacing: -.04em; overflow-wrap: anywhere; }
  .home-icon { color: var(--hk-accent); font-size: 25px; }
  .overview-toggle { display: flex; gap: 9px; align-items: center; min-height: 44px; padding: 8px 12px; border: 1px solid var(--hk-line); border-radius: 12px; background: transparent; font-size: 12px; }
  .overview-toggle span { color: var(--hk-muted); font-size: 11px; }
  .main-grid { display: grid; grid-template-columns: minmax(0, 1fr) minmax(230px, 27%); gap: 18px; padding: 8px 22px 22px; align-items: start; }
  .house-column { min-width: 0; }
  .house-drawing { min-width: 0; padding-top: 4px; background: radial-gradient(ellipse at 50% 50%, color-mix(in srgb, #dcbf87 10%, transparent), transparent 72%); }
  .building { display: block; width: 100%; height: auto; overflow: visible; }
  .compact-room-number { display: none; }
  .metric-panel-bg { fill: var(--hk-chip); stroke: #ffffff25; stroke-width: .7; }
  .metric-panel { pointer-events: none; }
  .metric-panel text { fill: #fff; font-family: inherit; }
  .chip-symbol { font-size: 8px; font-weight: 700; }
  .chip-symbol.temperature { fill: #ffc095; }
  .chip-symbol.relative_humidity { fill: #8dd6ee; }
  .chip-symbol.absolute_humidity { fill: #9bdad0; }
  .chip-symbol.co2 { fill: #b5d998; }
  .chip-symbol.voc { fill: #d7c0f0; }
  .chip-value { font-size: 15px; font-weight: 700; letter-spacing: -.25px; }
  .chip-unit { font-size: 9px; font-weight: 500; letter-spacing: 0; }
  .chip-status { font-size: 10px; letter-spacing: 0; }
  .chip-more { font-size: 8px; fill: #dce5e2 !important; }
  .compact-sensor-marker circle { fill: #2c4f3e; stroke: #f4efdf; stroke-width: 2; }
  .location-column { display: grid; gap: 16px; min-width: 0; padding-top: 22px; }
  .location-block { border: 1px solid var(--hk-line); border-radius: 18px; padding: 15px; min-width: 0; background: color-mix(in srgb, var(--hk-paper) 95%, #b9c5ac); }
  .location-heading { display: flex; align-items: center; justify-content: space-between; gap: 8px; width: 100%; min-height: 44px; border: 0; padding: 0 0 8px; background: transparent; text-align: left; font-size: 15px; font-weight: 650; }
  .location-heading > span:first-child { display: flex; align-items: center; gap: 9px; overflow-wrap: anywhere; }
  .location-heading > span:last-child { color: var(--hk-muted); font-size: 16px; }
  .location-icon { font-size: 21px; font-weight: 500; color: var(--hk-accent); }
  .outdoor-icon { color: #b28942; }
  .garage-picture { position: relative; display: block; width: 100%; border: none; background: transparent; padding: 0; min-height: 160px; }
  .garage-graphic { display: block; width: 100%; height: auto; }
  .garage-readings { position: absolute; left: 24%; right: 18%; bottom: 18%; border-radius: 10px; padding: 9px 11px; background: var(--hk-chip); color: #fff; pointer-events: none; }
  .garage-readings .empty-reading { color: #e4e9e6; font-size: 11px; }
  .location-caption { font-size: 10px; color: var(--hk-muted); text-align: center; margin: 5px 0 0; line-height: 1.5; }
  .room-readings { display: flex; gap: 6px 15px; flex-wrap: wrap; }
  .room-readings.compact { display: grid; gap: 5px; }
  .reading { display: flex; align-items: baseline; gap: 4px; min-width: 0; max-width: 100%; flex-wrap: wrap; }
  .reading strong { max-width: 100%; overflow-wrap: anywhere; font-size: 22px; line-height: 1.25; font-weight: 650; letter-spacing: -.04em; }
  .reading-icon { display: inline-flex; width: 16px; justify-content: center; flex-shrink: 0; align-self: center; color: #ffc095; font-size: 9px; font-weight: 700; }
  .reading-icon.relative_humidity { color: #8dd6ee; }
  .reading-icon.absolute_humidity { color: #9bdad0; }
  .reading-icon.co2 { color: #b5d998; }
  .reading-icon.voc { color: #d7c0f0; }
  .reading-unit { max-width: 100%; overflow-wrap: anywhere; font-size: 11px; color: #e0e5e3; }
  .reading .reading-status { font-size: 12px; letter-spacing: 0; overflow-wrap: anywhere; }
  .compact .reading strong { font-size: 17px; }
  .compact .reading-unit { font-size: 10px; }
  .empty-reading { font-size: 12px; font-weight: 400; color: #d5ddda; line-height: 1.5; }
  .section-title { display: flex; align-items: baseline; gap: 12px; justify-content: space-between; margin-bottom: 12px; }
  h2 { font-size: 17px; letter-spacing: -.03em; font-weight: 650; margin: 0; }
  .section-title > span { font-size: 10px; color: var(--hk-muted); line-height: 1.5; text-align: right; }
  .rooms-section { display: none; padding: 14px 3px 0; }
  .rooms-section.expanded { display: block; }
  .room-list { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(165px, 100%), 1fr)); gap: 10px; }
  .room-tile { display: flex; flex-direction: column; gap: 11px; min-width: 0; min-height: 112px; text-align: left; border: 1px solid #ffffff1a; border-radius: 13px; background: var(--hk-chip); color: #fff; padding: 13px; }
  .room-tile[aria-pressed='true'] { outline: 2px solid var(--hk-accent); outline-offset: 2px; }
  .tile-heading { display: flex; gap: 7px; align-items: baseline; width: 100%; font-size: 12px; font-weight: 600; }
  .tile-heading > span:nth-last-child(2) { overflow-wrap: anywhere; }
  .room-number { font-size: 9px; color: #c7d6c9; letter-spacing: .04em; }
  .arrow-icon { width: 13px; height: 13px; display: inline-block; vertical-align: middle; fill: none; stroke: currentColor; stroke-width: 1.5; stroke-linecap: round; stroke-linejoin: round; }
  .tile-arrow { color: #b7c4ba; margin-left: auto; }
  .tile-level { display: block; color: #b8c4bb; font-size: 9px; line-height: 1.5; margin-top: auto; }
  .other-rooms { margin: 0 24px 24px; border-top: 1px solid var(--hk-line); padding-top: 18px; }
  .outdoor-sources { display: grid; gap: 13px; }
  .outdoor-metric h3 { font-size: 10px; font-weight: 500; color: var(--hk-muted); margin: 0 0 5px; }
  .outdoor-source { display: flex; align-items: center; justify-content: space-between; gap: 9px; padding: 10px; width: 100%; min-height: 54px; border: none; border-radius: 10px; text-align: left; background: color-mix(in srgb, var(--hk-accent) 7%, transparent); font-size: 11px; margin-top: 5px; }
  .outdoor-source > span { min-width: 0; overflow-wrap: anywhere; }
  .outdoor-source small { display: block; color: var(--hk-muted); font-size: 9px; margin-top: 4px; }
  .outdoor-source strong { font-size: 13px; min-width: 0; max-width: 50%; overflow-wrap: anywhere; text-align: right; }
  .outdoor-empty { display: block; width: 100%; background: transparent; border: 0; padding: 14px 2px; text-align: left; color: var(--hk-muted); font-size: 12px; min-height: 44px; }
  .room-detail { margin: 10px 3px 18px; border: 1px solid var(--hk-line); background: color-mix(in srgb, var(--hk-paper) 95%, #bdcbb8); border-radius: 16px; padding: 18px; outline: none; }
  .detail-header { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 14px; }
  .section-kicker { display: block; color: var(--hk-muted); font-size: 10px; margin-bottom: 5px; }
  .close-detail { border: none; background: transparent; color: var(--hk-muted); width: 44px; height: 44px; font-size: 25px; border-radius: 12px; }
  .metric-list { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(220px, 100%), 1fr)); gap: 12px; }
  .metric-group { min-width: 0; border-radius: 12px; padding: 12px; background: var(--hk-chip); color: #fff; }
  .metric-heading { display: flex; align-items: center; justify-content: space-between; gap: 6px; flex-wrap: wrap; }
  .metric-heading h3 { display: flex; align-items: center; gap: 5px; font-size: 11px; font-weight: 500; color: #edf2ef; margin: 0; }
  .hidden-label { font-size: 9px; color: #d2ded5; }
  .sensor-row { display: flex; align-items: center; justify-content: space-between; gap: 10px; width: 100%; padding: 12px 0 6px; border: none; background: transparent; color: #fff; text-align: left; font-size: 11px; min-height: 64px; }
  .sensor-row + .sensor-row { margin-top: 6px; border-top: 1px solid #ffffff26; }
  .source-name { min-width: 0; font-weight: 550; overflow-wrap: anywhere; }
  .source-name small { display: block; font-size: 9px; font-weight: 400; color: #c6d1cb; margin-top: 3px; overflow-wrap: anywhere; }
  .sensor-meta { display: block; color: #c6d1cb; font-size: 9px; font-weight: 400; margin-top: 6px; line-height: 1.5; }
  .source-value { display: flex; flex-wrap: wrap; gap: 4px; justify-content: flex-end; align-items: baseline; text-align: right; max-width: 50%; flex-shrink: 0; }
  .source-value strong { font-size: 19px; font-weight: 650; letter-spacing: -.035em; overflow-wrap: anywhere; }
  .source-value > span { max-width: 100%; overflow-wrap: anywhere; font-size: 10px; color: #d8e1dc; }
  .source-value .entity-arrow { color: #b6cbbf; }
  .unavailable { color: var(--warning-color, #e9bb75); }
  .unavailable strong { font-size: 12px; letter-spacing: 0; }
  .detail-empty, .room-dimension { color: var(--hk-muted); font-size: 12px; line-height: 1.6; }
  .room-dimension { font-size: 10px; margin-bottom: 0; }
  .building-details { border-top: 1px solid var(--hk-line); padding: 0 24px; color: var(--hk-muted); font-size: 11px; line-height: 1.7; }
  .building-details summary { cursor: pointer; padding: 14px 0; min-height: 44px; }
  .building-details p { margin: 0 0 10px; }
  .building-details ul { padding-left: 17px; margin: 0 0 20px; }
  @supports ((backdrop-filter: blur(3px)) or (-webkit-backdrop-filter: blur(3px))) {
    .room-tile, .garage-readings, .metric-group { backdrop-filter: blur(3px); -webkit-backdrop-filter: blur(3px); }
  }
  @container hausklima (max-width: 780px) {
    .main-grid { grid-template-columns: minmax(0, 1fr); gap: 16px; padding: 6px 16px 18px; }
    .location-column { grid-template-columns: repeat(auto-fit, minmax(min(250px, 100%), 1fr)); padding-top: 0; }
    .rooms-section { display: block; }
    .room-list { grid-template-columns: repeat(auto-fit, minmax(min(145px, 100%), 1fr)); }
    .house-room-list { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .house-room-list .reading strong { font-size: 22px; }
    .other-rooms { margin: 0 16px 18px; }
    .garage-picture { max-width: 330px; margin: auto; }
    .metric-panel, .compact-sensor-marker { display: none; }
    .house-scene .compact-room-number { display: block; }
    .room-name { display: none; }
    .card-header { padding: 12px 16px 0; }
    h1 { font-size: 19px; }
    .room-detail { margin-top: 8px; margin-bottom: 18px; padding: 14px; }
    .house-drawing { max-width: 610px; margin: auto; }
    .building-details { padding: 0 16px; }
  }
  @container hausklima (max-width: 360px) {
    .room-tile { padding: 11px; }
    .house-room-list .reading strong { font-size: 20px; }
    .room-readings { gap: 5px 9px; }
    .section-title { gap: 8px; }
    .section-title > span { font-size: 9px; }
    .tile-heading { font-size: 11px; }
  }
`;var Ze={temperature:"T",relative_humidity:"%",absolute_humidity:"AH",co2:"CO\u2082",voc:"VOC"},O=o=>o.toLocaleString("de-DE",{maximumFractionDigits:2}),Ce=()=>g`<svg class="arrow-icon" viewBox="0 0 16 16" aria-hidden="true"><path d="M 4 12 12 4 M 4 4 h 8 v 8" /></svg>`,ci=0,Fe=class extends k{constructor(){super(...arguments);this._showRooms=!1;this.drawingId=`hausklima-${++ci}`}static{this.properties={hass:{attribute:!1},_config:{state:!0},_selected:{state:!0},_showRooms:{state:!0}}}setConfig(t){this._config=A(t),w(this._config).rooms.some(i=>i.id===this._selected)||(this._selected=void 0)}static async getConfigElement(){return await Promise.resolve().then(()=>(Bt(),It)),document.createElement("hausklima-card-editor")}static getStubConfig(){let{type:t,...i}=te();return i}getCardSize(){return Math.ceil((this.clientHeight||680)/50)}getGridOptions(){return{columns:12,rows:"auto",min_columns:6}}selectRoom(t){this._selected=t.id,this.updateComplete.then(()=>{let i=this.renderRoot.querySelector(".room-detail");if(i?.focus({preventScroll:!0}),i){let s=i.getBoundingClientRect();(s.top<0||s.top>window.innerHeight-80)&&i.scrollIntoView({block:"start",behavior:"auto"})}})}sensorText(t){return`${ie(t,this.hass)}${t.status==="available"&&t.unit?` ${t.unit}`:""}`}showEntity(t){this.dispatchEvent(new CustomEvent("hass-more-info",{detail:{entityId:t},bubbles:!0,composed:!0}))}renderSvgMetrics(t){let i=N(t.room,this.hass,"overview");if(!i.length)return u;if(t.width<130||t.height<75)return f`<g class="compact-sensor-marker" aria-hidden="true">
        <circle cx=${t.x+t.width/2} cy=${t.y+t.height-17} r="5" />
        <title>${i.map(d=>`${d.label}: ${this.sensorText(d.primary)}`).join(", ")}</title>
      </g>`;let s=Math.min(t.width-20,150),r=Math.max(1,Math.min(3,Math.floor((t.height-51)/20))),n=i.slice(0,r),a=i.length-n.length,l=16+n.length*21+(a?16:0),h=t.x+(t.width-s)/2,c=t.y+33;return f`<g class="metric-panel" data-overview-chip data-room-id=${t.room.id} aria-hidden="true">
      <rect class="metric-panel-bg" x=${h} y=${c} width=${s} height=${l} rx="9" />
      ${n.map((d,p)=>{let m=ie(d.primary,this.hass),v=d.primary.status==="available"?d.primary.unit:"",re=m.length*(d.primary.status==="available"?8.5:5)+v.length*5<=s-42;return f`
          <text class="chip-symbol ${d.type}" x=${h+11} y=${c+23+p*21}>${Ze[d.type]}</text>
          <text class="chip-value ${!re||d.primary.status!=="available"?"chip-status":""}" x=${h+32} y=${c+23+p*21}>
            ${re?m:d.primary.status==="unavailable"?"Ausfall":"Details"}<tspan class="chip-unit">${re&&v?` ${v}`:""}</tspan>
          </text>
        `})}
      ${a?f`<text class="chip-more" x=${h+12} y=${c+l-9}>+${a} Details</text>`:u}
      <title>${i.map(d=>`${d.label}: ${this.sensorText(d.primary)}`).join(", ")}</title>
    </g>`}renderReadings(t,i=!1){let s=N(t,this.hass,"overview");return s.length?g`<span class=${i?"room-readings compact":"room-readings"}>
      ${s.map(r=>g`<span class="reading" data-metric=${r.type} title=${r.label}>
        <span class="reading-icon ${r.type}" aria-label=${r.label}>${Ze[r.type]}</span>
        <strong class=${r.primary.status==="available"?"":"reading-status"}>${ie(r.primary,this.hass)}</strong>
        ${r.primary.status==="available"&&r.primary.unit?g`<span class="reading-unit">${r.primary.unit}</span>`:u}
      </span>`)}
    </span>`:g`<span class="empty-reading">${N(t,this.hass,"details").length?"Messwerte in den Details":"Keine Sensoren zugeordnet"}</span>`}renderRoomTile(t,i,s){let r=i.levels.find(n=>n.id===t.level_id);return g`<button class="room-tile" data-select-room=${t.id} aria-pressed=${String(this._selected===t.id)} @click=${()=>this.selectRoom(t)}>
      <span class="tile-heading">${s!==void 0?g`<span class="room-number">${String(s).padStart(2,"0")}</span>`:u}
        <span>${t.name}</span><span class="tile-arrow" aria-hidden="true">${Ce()}</span></span>
      ${this.renderReadings(t)}
      <span class="tile-level">${t.location==="outdoor"?"Au\xDFenmessort":r?.name}</span>
    </button>`}renderDetails(t,i){let s=N(t,this.hass,"details"),r=i.levels.find(n=>n.id===t.level_id);return g`<section class="room-detail" data-room-id=${t.id} tabindex="-1" aria-label="Raumdetails">
      <div class="detail-header"><div><span class="section-kicker">${t.location==="outdoor"?"Au\xDFenmessort":r?.name}</span>
        <h2>${t.name}</h2></div><button class="close-detail" aria-label="Raumdetails schließen" @click=${()=>{this._selected=void 0}}>×</button></div>
      ${s.length?g`<div class="metric-list">${s.map(n=>this.renderDetailMetric(n))}</div>`:g`<p class="detail-empty">Noch keine Sensoren zugeordnet. Im grafischen Karteneditor kannst du für diesen Messort Sensoren auswählen.</p>`}
      ${this._config?.show_dimensions&&t.width_m!==null?g`<p class="room-dimension">Angegebene Raumbreite: ${O(t.width_m)} m</p>`:u}
    </section>`}renderDetailMetric(t){return g`<section class="metric-group" data-metric=${t.type} aria-label=${t.label}>
      <div class="metric-heading"><h3><span class="reading-icon ${t.type}" aria-hidden="true">${Ze[t.type]}</span>${t.label}</h3>
        ${!t.visible||!t.show_in_overview?g`<span class="hidden-label">Nur in Details</span>`:u}</div>
      ${t.sensors.map(i=>g`<button class="sensor-row ${i.is_primary?"primary-sensor":""}" data-entity=${i.entity} @click=${()=>this.showEntity(i.entity)}>
        <span class="source-name">${i.name}<small>${i.entity}</small><span class="sensor-meta">${i.is_primary?"Hauptsensor":"Weitere Quelle"} · ${Oe(i.status)}</span></span>
        <span class="source-value ${i.status!=="available"?"unavailable":""}"><strong>${ie(i,this.hass)}</strong>
          ${i.status==="available"&&i.unit?g`<span>${i.unit}</span>`:u}<span class="entity-arrow" aria-hidden="true">${Ce()}</span></span>
      </button>`)}
    </section>`}renderGarage(t){return g`<section class="garage-block location-block" aria-label=${t.name}>
      <button class="location-heading" data-select-room=${t.id} @click=${()=>this.selectRoom(t)}><span><span class="location-icon" aria-hidden="true">▤</span>${t.name}</span><span aria-hidden="true">${Ce()}</span></button>
      <button class="garage-picture" aria-label=${`${t.name} \u2013 Raumdetails \xF6ffnen`} @click=${()=>this.selectRoom(t)}>
        <svg class="garage-graphic" viewBox="0 0 320 196" role="img" aria-label="Freistehende Garage, schematische Darstellung">
          <defs><linearGradient id="${this.drawingId}-garage-wall" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#e0d3bd"/><stop offset="1" stop-color="#bbaa91"/></linearGradient>
          <linearGradient id="${this.drawingId}-garage-door" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#69716d"/><stop offset="1" stop-color="#3c4942"/></linearGradient></defs>
          <ellipse cx="163" cy="173" rx="134" ry="13" fill="#1e302219"/>
          <path d="M 43 55 L 66 37 H 284 V 151 L 263 173 Z" fill="#b1a48e"/>
          <rect x="42" y="56" width="222" height="116" fill="url(#${this.drawingId}-garage-wall)" stroke="#8a826f" stroke-width="1"/>
          <path d="M 35 55 L 60 36 H 291 L 270 55 Z" fill="#59605a" stroke="#424c46" stroke-width="3"/>
          <rect x="64" y="77" width="177" height="93" rx="3" fill="url(#${this.drawingId}-garage-door)" stroke="#424a44" stroke-width="4"/>
          <path d="M 67 99 H 238 M 67 121 H 238 M 67 144 H 238" stroke="#a8b1a366" stroke-width="2"/>
          <path d="M 22 175 H 294" stroke="#83a170" stroke-width="4"/>
        </svg>
        <span class="garage-readings">${this.renderReadings(t,!0)}</span>
      </button>
      <p class="location-caption">Freistehend rechts vom Wohnhaus</p>
    </section>`}renderOutdoor(t){let i=N(t,this.hass,"overview");return g`<section class="outdoor-block location-block" aria-label=${t.name}>
      <button class="location-heading" data-select-room=${t.id} @click=${()=>this.selectRoom(t)}><span><span class="location-icon outdoor-icon" aria-hidden="true">☀</span>${t.name}</span><span aria-hidden="true">${Ce()}</span></button>
      ${i.length?g`<div class="outdoor-sources">${i.map(s=>g`<div class="outdoor-metric"><h3>${s.label}</h3>
        ${s.sensors.map(r=>g`<button class="outdoor-source" @click=${()=>this.selectRoom(t)}><span>${r.name}<small>${r.is_primary?"Hauptsensor":"Weitere Quelle"}</small></span>
          <strong class=${r.status!=="available"?"unavailable":""}>${this.sensorText(r)}</strong></button>`)}</div>`)}</div>`:g`<button class="outdoor-empty" @click=${()=>this.selectRoom(t)}>${N(t,this.hass,"details").length?"Alle Messwerte in den Details \xF6ffnen":"Noch keine Sensoren zugeordnet"}</button>`}
    </section>`}renderBuildingDetails(t){return g`<details class="building-details"><summary>Gebäudedetails</summary>
      <p>Traufansicht · Haus ${O(t.house.width_m)} × ${O(t.house.depth_m)} m. First parallel zur sichtbaren Seite.</p>
      <p>Garage ${O(t.garage.width_m)} × ${O(t.garage.depth_m)} m, Höhe ${O(t.garage.height_m)} m. Abstand ${t.garage.gap_is_approximate?"ca. ":""}${O(t.garage.gap_m)} m.</p>
      <p>Wandzuordnung, Restbreiten und endgültige Dachgeometrie sind offen. Die Tiefenwirkung und die Einrichtung sind illustrative Gestaltung, keine bestätigten Gebäudedetails.</p>
      <ul>${t.notes.map(i=>g`<li>${i}</li>`)}</ul>
    </details>`}render(){if(!this._config)return u;let t=this._config,i=w(t),r=be(i).shapes.filter(p=>p.level!=="garage"&&p.room.location!=="outdoor"),n=new Set(r.map(p=>p.room.id)),a=i.rooms.filter(p=>p.location==="outdoor"),l=i.rooms.filter(p=>p.location!=="outdoor"&&i.levels.find(m=>m.id===p.level_id)?.building_id==="garage"),h=new Set(l.map(p=>p.id)),c=i.rooms.filter(p=>!n.has(p.id)&&!h.has(p.id)&&p.location!=="outdoor"),d=i.rooms.find(p=>p.id===this._selected);return g`<ha-card>
      <header class="card-header"><div class="card-title"><span class="home-icon" aria-hidden="true">⌂</span>${t.title?g`<h1>${t.title}</h1>`:u}</div>
        <button class="overview-toggle" aria-expanded=${String(this._showRooms)} @click=${()=>{this._showRooms=!this._showRooms}}>Räume <span>${i.rooms.length}</span></button></header>
      <div class="main-grid">
        <div class="house-column">
          <div class="house-drawing" aria-label="Hausansicht">${_t(i,{idPrefix:this.drawingId,selected:this._selected,showNames:t.show_room_names??!0,showDimensions:!1,onSelect:p=>this.selectRoom(p),renderMetrics:p=>this.renderSvgMetrics(p)})}</div>
          ${d?this.renderDetails(d,i):u}
          <section class="rooms-section ${this._showRooms?"expanded":""}" aria-label="Raumübersicht">
            <div class="section-title"><h2>Räume</h2><span>Antippen für alle Quellen</span></div>
            <div class="room-list house-room-list">${r.map((p,m)=>this.renderRoomTile(p.room,i,m+1))}</div>
          </section>
        </div>
        ${a.length||l.length?g`<aside class="location-column" aria-label="Außen und Garage">${a.map(p=>this.renderOutdoor(p))}${l.map(p=>this.renderGarage(p))}</aside>`:u}
      </div>
      ${c.length?g`<section class="other-rooms" aria-label="Weitere Räume"><div class="section-title"><h2>Weitere Räume</h2><span>Alle Messorte, auch außerhalb der Hausansicht</span></div>
        <div class="room-list">${c.map(p=>this.renderRoomTile(p,i))}</div></section>`:u}
      ${t.show_dimensions?this.renderBuildingDetails(i):u}
    </ha-card>`}static{this.styles=[xt,wt]}};customElements.get("hausklima-card")||customElements.define("hausklima-card",Fe);var qe=window;qe.customCards??=[];qe.customCards.some(o=>o.type==="hausklima-card")||qe.customCards.push({type:"hausklima-card",name:"HausKlima Card",description:"R\xE4umliche Hausklima\xFCbersicht mit schematischer Geb\xE4udeansicht.",preview:!0});
