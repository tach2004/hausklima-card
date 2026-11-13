/*! HausKlima Card v0.1.0 | MIT License | https://github.com/tach2004/hausklima-card */
var st=Object.defineProperty;var x=(n,e)=>()=>(n&&(e=n(n=0)),e);var nt=(n,e)=>{for(var t in e)st(n,t,{get:e[t],enumerable:!0})};var Y,q,oe,Re,D,Te,U,Me,ae,le=x(()=>{/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */Y=globalThis,q=Y.ShadowRoot&&(Y.ShadyCSS===void 0||Y.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,oe=Symbol(),Re=new WeakMap,D=class{constructor(e,t,s){if(this._$cssResult$=!0,s!==oe)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o,t=this.t;if(q&&e===void 0){let s=t!==void 0&&t.length===1;s&&(e=Re.get(t)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),s&&Re.set(t,e))}return e}toString(){return this.cssText}},Te=n=>new D(typeof n=="string"?n:n+"",void 0,oe),U=(n,...e)=>{let t=n.length===1?n[0]:e.reduce((s,i,r)=>s+(o=>{if(o._$cssResult$===!0)return o.cssText;if(typeof o=="number")return o;throw Error("Value passed to 'css' function must be a 'css' function result: "+o+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+n[r+1],n[0]);return new D(t,n,oe)},Me=(n,e)=>{if(q)n.adoptedStyleSheets=e.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(let t of e){let s=document.createElement("style"),i=Y.litNonce;i!==void 0&&s.setAttribute("nonce",i),s.textContent=t.cssText,n.appendChild(s)}},ae=q?n=>n:n=>n instanceof CSSStyleSheet?(e=>{let t="";for(let s of e.cssRules)t+=s.cssText;return Te(t)})(n):n});var rt,ot,at,lt,dt,ht,Z,He,ct,pt,O,de,Pe,ze,w,X=x(()=>{le();le();/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */({is:rt,defineProperty:ot,getOwnPropertyDescriptor:at,getOwnPropertyNames:lt,getOwnPropertySymbols:dt,getPrototypeOf:ht}=Object),Z=globalThis,He=Z.trustedTypes,ct=He?He.emptyScript:"",pt=Z.reactiveElementPolyfillSupport,O=(n,e)=>n,de={toAttribute(n,e){switch(e){case Boolean:n=n?ct:null;break;case Object:case Array:n=n==null?n:JSON.stringify(n)}return n},fromAttribute(n,e){let t=n;switch(e){case Boolean:t=n!==null;break;case Number:t=n===null?null:Number(n);break;case Object:case Array:try{t=JSON.parse(n)}catch{t=null}}return t}},Pe=(n,e)=>!rt(n,e),ze={attribute:!0,type:String,converter:de,reflect:!1,useDefault:!1,hasChanged:Pe};Symbol.metadata??=Symbol("metadata"),Z.litPropertyMetadata??=new WeakMap;w=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=ze){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){let s=Symbol(),i=this.getPropertyDescriptor(e,s,t);i!==void 0&&ot(this.prototype,e,i)}}static getPropertyDescriptor(e,t,s){let{get:i,set:r}=at(this.prototype,e)??{get(){return this[t]},set(o){this[t]=o}};return{get:i,set(o){let h=i?.call(this);r?.call(this,o),this.requestUpdate(e,h,s)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??ze}static _$Ei(){if(this.hasOwnProperty(O("elementProperties")))return;let e=ht(this);e.finalize(),e.l!==void 0&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(O("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(O("properties"))){let t=this.properties,s=[...lt(t),...dt(t)];for(let i of s)this.createProperty(i,t[i])}let e=this[Symbol.metadata];if(e!==null){let t=litPropertyMetadata.get(e);if(t!==void 0)for(let[s,i]of t)this.elementProperties.set(s,i)}this._$Eh=new Map;for(let[t,s]of this.elementProperties){let i=this._$Eu(t,s);i!==void 0&&this._$Eh.set(i,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){let t=[];if(Array.isArray(e)){let s=new Set(e.flat(1/0).reverse());for(let i of s)t.unshift(ae(i))}else e!==void 0&&t.push(ae(e));return t}static _$Eu(e,t){let s=t.attribute;return s===!1?void 0:typeof s=="string"?s:typeof e=="string"?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),this.renderRoot!==void 0&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){let e=new Map,t=this.constructor.elementProperties;for(let s of t.keys())this.hasOwnProperty(s)&&(e.set(s,this[s]),delete this[s]);e.size>0&&(this._$Ep=e)}createRenderRoot(){let e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return Me(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,s){this._$AK(e,s)}_$ET(e,t){let s=this.constructor.elementProperties.get(e),i=this.constructor._$Eu(e,s);if(i!==void 0&&s.reflect===!0){let r=(s.converter?.toAttribute!==void 0?s.converter:de).toAttribute(t,s.type);this._$Em=e,r==null?this.removeAttribute(i):this.setAttribute(i,r),this._$Em=null}}_$AK(e,t){let s=this.constructor,i=s._$Eh.get(e);if(i!==void 0&&this._$Em!==i){let r=s.getPropertyOptions(i),o=typeof r.converter=="function"?{fromAttribute:r.converter}:r.converter?.fromAttribute!==void 0?r.converter:de;this._$Em=i;let h=o.fromAttribute(t,r.type);this[i]=h??this._$Ej?.get(i)??h,this._$Em=null}}requestUpdate(e,t,s,i=!1,r){if(e!==void 0){let o=this.constructor;if(i===!1&&(r=this[e]),s??=o.getPropertyOptions(e),!((s.hasChanged??Pe)(r,t)||s.useDefault&&s.reflect&&r===this._$Ej?.get(e)&&!this.hasAttribute(o._$Eu(e,s))))return;this.C(e,t,s)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(e,t,{useDefault:s,reflect:i,wrapped:r},o){s&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,o??t??this[e]),r!==!0||o!==void 0)||(this._$AL.has(e)||(this.hasUpdated||s||(t=void 0),this._$AL.set(e,t)),i===!0&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}let e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(let[i,r]of this._$Ep)this[i]=r;this._$Ep=void 0}let s=this.constructor.elementProperties;if(s.size>0)for(let[i,r]of s){let{wrapped:o}=r,h=this[i];o!==!0||this._$AL.has(i)||h===void 0||this.C(i,void 0,r,h)}}let e=!1,t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(s=>s.hostUpdate?.()),this.update(t)):this._$EM()}catch(s){throw e=!1,this._$EM(),s}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM()}updated(e){}firstUpdated(e){}};w.elementStyles=[],w.shadowRootOptions={mode:"open"},w[O("elementProperties")]=new Map,w[O("finalized")]=new Map,pt?.({ReactiveElement:w}),(Z.reactiveElementVersions??=[]).push("2.1.2")});function Ge(n,e){if(!_e(n)||!n.hasOwnProperty("raw"))throw Error("invalid template strings array");return Ue!==void 0?Ue.createHTML(e):e}function M(n,e,t=n,s){if(e===R)return e;let i=s!==void 0?t._$Co?.[s]:t._$Cl,r=B(e)?void 0:e._$litDirective$;return i?.constructor!==r&&(i?._$AO?.(!1),r===void 0?i=void 0:(i=new r(n),i._$AT(n,t,s)),s!==void 0?(t._$Co??=[])[s]=i:t._$Cl=i),i!==void 0&&(e=M(n,i._$AS(n,e.values),i,s)),e}var fe,De,J,Ue,We,A,je,ut,S,L,B,_e,mt,he,N,Oe,Ne,E,Le,Be,Ke,be,f,k,Mt,R,p,Ie,C,gt,I,ce,W,H,pe,ue,me,ge,ft,Fe,Q=x(()=>{/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */fe=globalThis,De=n=>n,J=fe.trustedTypes,Ue=J?J.createPolicy("lit-html",{createHTML:n=>n}):void 0,We="$lit$",A=`lit$${Math.random().toFixed(9).slice(2)}$`,je="?"+A,ut=`<${je}>`,S=document,L=()=>S.createComment(""),B=n=>n===null||typeof n!="object"&&typeof n!="function",_e=Array.isArray,mt=n=>_e(n)||typeof n?.[Symbol.iterator]=="function",he=`[ 	
\f\r]`,N=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,Oe=/-->/g,Ne=/>/g,E=RegExp(`>|${he}(?:([^\\s"'>=/]+)(${he}*=${he}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),Le=/'/g,Be=/"/g,Ke=/^(?:script|style|textarea|title)$/i,be=n=>(e,...t)=>({_$litType$:n,strings:e,values:t}),f=be(1),k=be(2),Mt=be(3),R=Symbol.for("lit-noChange"),p=Symbol.for("lit-nothing"),Ie=new WeakMap,C=S.createTreeWalker(S,129);gt=(n,e)=>{let t=n.length-1,s=[],i,r=e===2?"<svg>":e===3?"<math>":"",o=N;for(let h=0;h<t;h++){let d=n[h],a,c,l=-1,u=0;for(;u<d.length&&(o.lastIndex=u,c=o.exec(d),c!==null);)u=o.lastIndex,o===N?c[1]==="!--"?o=Oe:c[1]!==void 0?o=Ne:c[2]!==void 0?(Ke.test(c[2])&&(i=RegExp("</"+c[2],"g")),o=E):c[3]!==void 0&&(o=E):o===E?c[0]===">"?(o=i??N,l=-1):c[1]===void 0?l=-2:(l=o.lastIndex-c[2].length,a=c[1],o=c[3]===void 0?E:c[3]==='"'?Be:Le):o===Be||o===Le?o=E:o===Oe||o===Ne?o=N:(o=E,i=void 0);let m=o===E&&n[h+1].startsWith("/>")?" ":"";r+=o===N?d+ut:l>=0?(s.push(a),d.slice(0,l)+We+d.slice(l)+A+m):d+A+(l===-2?h:m)}return[Ge(n,r+(n[t]||"<?>")+(e===2?"</svg>":e===3?"</math>":"")),s]},I=class n{constructor({strings:e,_$litType$:t},s){let i;this.parts=[];let r=0,o=0,h=e.length-1,d=this.parts,[a,c]=gt(e,t);if(this.el=n.createElement(a,s),C.currentNode=this.el.content,t===2||t===3){let l=this.el.content.firstChild;l.replaceWith(...l.childNodes)}for(;(i=C.nextNode())!==null&&d.length<h;){if(i.nodeType===1){if(i.hasAttributes())for(let l of i.getAttributeNames())if(l.endsWith(We)){let u=c[o++],m=i.getAttribute(l).split(A),_=/([.?@])?(.*)/.exec(u);d.push({type:1,index:r,name:_[2],strings:m,ctor:_[1]==="."?pe:_[1]==="?"?ue:_[1]==="@"?me:H}),i.removeAttribute(l)}else l.startsWith(A)&&(d.push({type:6,index:r}),i.removeAttribute(l));if(Ke.test(i.tagName)){let l=i.textContent.split(A),u=l.length-1;if(u>0){i.textContent=J?J.emptyScript:"";for(let m=0;m<u;m++)i.append(l[m],L()),C.nextNode(),d.push({type:2,index:++r});i.append(l[u],L())}}}else if(i.nodeType===8)if(i.data===je)d.push({type:2,index:r});else{let l=-1;for(;(l=i.data.indexOf(A,l+1))!==-1;)d.push({type:7,index:r}),l+=A.length-1}r++}}static createElement(e,t){let s=S.createElement("template");return s.innerHTML=e,s}};ce=class{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){let{el:{content:t},parts:s}=this._$AD,i=(e?.creationScope??S).importNode(t,!0);C.currentNode=i;let r=C.nextNode(),o=0,h=0,d=s[0];for(;d!==void 0;){if(o===d.index){let a;d.type===2?a=new W(r,r.nextSibling,this,e):d.type===1?a=new d.ctor(r,d.name,d.strings,this,e):d.type===6&&(a=new ge(r,this,e)),this._$AV.push(a),d=s[++h]}o!==d?.index&&(r=C.nextNode(),o++)}return C.currentNode=S,i}p(e){let t=0;for(let s of this._$AV)s!==void 0&&(s.strings!==void 0?(s._$AI(e,s,t),t+=s.strings.length-2):s._$AI(e[t])),t++}},W=class n{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,s,i){this.type=2,this._$AH=p,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=s,this.options=i,this._$Cv=i?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode,t=this._$AM;return t!==void 0&&e?.nodeType===11&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=M(this,e,t),B(e)?e===p||e==null||e===""?(this._$AH!==p&&this._$AR(),this._$AH=p):e!==this._$AH&&e!==R&&this._(e):e._$litType$!==void 0?this.$(e):e.nodeType!==void 0?this.T(e):mt(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==p&&B(this._$AH)?this._$AA.nextSibling.data=e:this.T(S.createTextNode(e)),this._$AH=e}$(e){let{values:t,_$litType$:s}=e,i=typeof s=="number"?this._$AC(e):(s.el===void 0&&(s.el=I.createElement(Ge(s.h,s.h[0]),this.options)),s);if(this._$AH?._$AD===i)this._$AH.p(t);else{let r=new ce(i,this),o=r.u(this.options);r.p(t),this.T(o),this._$AH=r}}_$AC(e){let t=Ie.get(e.strings);return t===void 0&&Ie.set(e.strings,t=new I(e)),t}k(e){_e(this._$AH)||(this._$AH=[],this._$AR());let t=this._$AH,s,i=0;for(let r of e)i===t.length?t.push(s=new n(this.O(L()),this.O(L()),this,this.options)):s=t[i],s._$AI(r),i++;i<t.length&&(this._$AR(s&&s._$AB.nextSibling,i),t.length=i)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){let s=De(e).nextSibling;De(e).remove(),e=s}}setConnected(e){this._$AM===void 0&&(this._$Cv=e,this._$AP?.(e))}},H=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,s,i,r){this.type=1,this._$AH=p,this._$AN=void 0,this.element=e,this.name=t,this._$AM=i,this.options=r,s.length>2||s[0]!==""||s[1]!==""?(this._$AH=Array(s.length-1).fill(new String),this.strings=s):this._$AH=p}_$AI(e,t=this,s,i){let r=this.strings,o=!1;if(r===void 0)e=M(this,e,t,0),o=!B(e)||e!==this._$AH&&e!==R,o&&(this._$AH=e);else{let h=e,d,a;for(e=r[0],d=0;d<r.length-1;d++)a=M(this,h[s+d],t,d),a===R&&(a=this._$AH[d]),o||=!B(a)||a!==this._$AH[d],a===p?e=p:e!==p&&(e+=(a??"")+r[d+1]),this._$AH[d]=a}o&&!i&&this.j(e)}j(e){e===p?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}},pe=class extends H{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===p?void 0:e}},ue=class extends H{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==p)}},me=class extends H{constructor(e,t,s,i,r){super(e,t,s,i,r),this.type=5}_$AI(e,t=this){if((e=M(this,e,t,0)??p)===R)return;let s=this._$AH,i=e===p&&s!==p||e.capture!==s.capture||e.once!==s.once||e.passive!==s.passive,r=e!==p&&(s===p||i);i&&this.element.removeEventListener(this.name,this,s),r&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}},ge=class{constructor(e,t,s){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=s}get _$AU(){return this._$AM._$AU}_$AI(e){M(this,e)}},ft=fe.litHtmlPolyfillSupport;ft?.(I,W),(fe.litHtmlVersions??=[]).push("3.3.3");Fe=(n,e,t)=>{let s=t?.renderBefore??e,i=s._$litPart$;if(i===void 0){let r=t?.renderBefore??null;s._$litPart$=i=new W(e.insertBefore(L(),r),r,void 0,t??{})}return i._$AI(n),i}});var $e,v,_t,Ve=x(()=>{X();X();Q();Q();/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */$e=globalThis,v=class extends w{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){let e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){let t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=Fe(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return R}};v._$litElement$=!0,v.finalized=!0,$e.litElementHydrateSupport?.({LitElement:v});_t=$e.litElementPolyfillSupport;_t?.({LitElement:v});($e.litElementVersions??=[]).push("4.2.2")});var Ye=x(()=>{/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */});var ee=x(()=>{X();Q();Ve();Ye()});function qe(){return structuredClone(bt)}var bt,Ze=x(()=>{"use strict";bt={house:{width_m:12,depth_m:10},garage:{width_m:6,depth_m:6,height_m:3,gap_m:5,gap_is_approximate:!0},walls:{stated_thickness_m:.24,exterior_thickness_m:null,interior_thickness_m:null},roof:{knee_wall_height_m:1,interior_ridge_height_m:4,pitch_degrees:null},levels:[{id:"basement",name:"Keller",building_id:"house",clear_height_m:2.5},{id:"ground_floor",name:"Erdgeschoss",building_id:"house",clear_height_m:2.64},{id:"attic",name:"Dachgeschoss",building_id:"house",clear_height_m:null},{id:"garage",name:"Garage",building_id:"garage",clear_height_m:null}],layers:[{id:"main",name:"Sichtbare Raumebene"}],rooms:[{id:"workshop",name:"Werkstatt",level_id:"basement",layer_id:"main",visible:!0,width_m:4},{id:"basement_hall",name:"Flur",level_id:"basement",layer_id:"main",visible:!0,width_m:3.4},{id:"laundry",name:"Waschk\xFCche",level_id:"basement",layer_id:"main",visible:!0,width_m:3.5},{id:"living_room",name:"Wohnzimmer",level_id:"ground_floor",layer_id:"main",visible:!0,width_m:6.5},{id:"ground_hall",name:"Flur",level_id:"ground_floor",layer_id:"main",visible:!0,width_m:.9},{id:"kitchen",name:"K\xFCche",level_id:"ground_floor",layer_id:"main",visible:!0,width_m:3.51},{id:"bedroom",name:"Schlafzimmer",level_id:"attic",layer_id:"main",visible:!0,width_m:7.6},{id:"storage",name:"Abstellraum",level_id:"attic",layer_id:"main",visible:!0,width_m:3.6},{id:"garage",name:"Garage",level_id:"garage",layer_id:"main",visible:!0,width_m:6}],notes:["Die Raumma\xDFe schlie\xDFen die 12 m Au\xDFenbreite nicht vollst\xE4ndig. Es erfolgt keine automatische Anpassung.","0,24 m ist eine angegebene Wandst\xE4rke. Ihre Zuordnung zu Au\xDFen- und Innenw\xE4nden ist offen.","Die 12-m-Traufseite ist sichtbar; der Dachfirst verl\xE4uft parallel zur Fassade.","Dachneigung, Dach\xFCberst\xE4nde, Deckendicken und endg\xFCltige Cutaway-Tiefe sind ungekl\xE4rt.","Die freistehende Garage liegt rechts vom Haus; der Abstand betr\xE4gt ungef\xE4hr 5 m."]}});var te,xe=x(()=>{"use strict";te=["temperature","relative_humidity","absolute_humidity","co2","voc"]});function $(n,e){if(n===null||typeof n!="object"||Array.isArray(n))throw new Error(`${e} muss ein Objekt sein.`);return n}function T(n,e){if(typeof n!="string"||n.trim()==="")throw new Error(`${e} muss eine nicht leere Zeichenfolge sein.`)}function b(n,e,t=!1){if(!(t&&n===null)&&(typeof n!="number"||!Number.isFinite(n)||n<=0))throw new Error(`${e} muss eine positive, endliche Zahl${t?" oder null":""} sein.`)}function j(n,e){if(typeof n!="boolean")throw new Error(`${e} muss ein boolescher Wert sein.`)}function ye(n,e){if(!Array.isArray(n))throw new Error(`${e} muss eine Liste sein.`);return n}function ve(n,e){let t=ye(n,e).map((i,r)=>$(i,`${e}[${r}]`)),s=new Set;return t.forEach((i,r)=>{if(T(i.id,`${e}[${r}].id`),T(i.name,`${e}[${r}].name`),s.has(i.id))throw new Error(`${e}: doppelte ID ${i.id}.`);s.add(i.id)}),t}function $t(n,e){let t=$(n,e);for(let[s,i]of Object.entries(t)){if(!te.includes(s))throw new Error(`${e}: unbekannter Messwerttyp ${s}.`);let r=`${e}.${s}`,o=$(i,r),h=ye(o.sensors,`${r}.sensors`),d=new Set;if(h.forEach((a,c)=>{let l=$(a,`${r}.sensors[${c}]`);if(T(l.entity,`${r}.sensors[${c}].entity`),!/^[a-z_][a-z0-9_]*\.[a-z0-9_]+$/.test(l.entity))throw new Error(`${r}: ung\xFCltige Entity-ID ${l.entity}.`);if(d.has(l.entity))throw new Error(`${r}: doppelte Entity-ID ${l.entity}.`);d.add(l.entity),l.name!==void 0&&T(l.name,`${r}.sensors[${c}].name`)}),o.primary!==void 0&&(T(o.primary,`${r}.primary`),!d.has(o.primary)))throw new Error(`${r}.primary muss einen konfigurierten Sensor referenzieren.`);if(o.visible!==void 0&&j(o.visible,`${r}.visible`),o.position!==void 0){let a=$(o.position,`${r}.position`);for(let c of["x","y"]){let l=a[c];if(typeof l!="number"||!Number.isFinite(l)||l<0||l>1)throw new Error(`${r}.position.${c} muss zwischen 0 und 1 liegen.`)}}}}function xt(n){let e=$(n,"building"),t=$(e.house,"building.house");b(t.width_m,"building.house.width_m"),b(t.depth_m,"building.house.depth_m");let s=$(e.garage,"building.garage");for(let l of["width_m","depth_m","height_m","gap_m"])b(s[l],`building.garage.${l}`);j(s.gap_is_approximate,"building.garage.gap_is_approximate");let i=$(e.walls,"building.walls");b(i.stated_thickness_m,"building.walls.stated_thickness_m"),b(i.exterior_thickness_m,"building.walls.exterior_thickness_m",!0),b(i.interior_thickness_m,"building.walls.interior_thickness_m",!0);let r=$(e.roof,"building.roof");if(b(r.knee_wall_height_m,"building.roof.knee_wall_height_m"),b(r.interior_ridge_height_m,"building.roof.interior_ridge_height_m"),b(r.pitch_degrees,"building.roof.pitch_degrees",!0),typeof r.pitch_degrees=="number"&&r.pitch_degrees>=90)throw new Error("building.roof.pitch_degrees muss kleiner als 90 sein.");if(r.interior_ridge_height_m<r.knee_wall_height_m)throw new Error("Die Firsth\xF6he darf nicht unter der Kniestockh\xF6he liegen.");let o=ve(e.levels,"building.levels"),h=ve(e.layers,"building.layers"),d=ve(e.rooms,"building.rooms");if(o.length===0)throw new Error("building.levels ben\xF6tigt mindestens eine Ebene.");o.forEach((l,u)=>{if(l.building_id!=="house"&&l.building_id!=="garage")throw new Error(`building.levels[${u}].building_id muss house oder garage sein.`);b(l.clear_height_m,`building.levels[${u}].clear_height_m`,!0)});let a=new Set(o.map(l=>l.id)),c=new Set(h.map(l=>l.id));d.forEach((l,u)=>{let m=`building.rooms[${u}]`;if(T(l.level_id,`${m}.level_id`),!a.has(l.level_id))throw new Error(`${m}.level_id referenziert keine vorhandene Ebene.`);if(l.layer_id!==void 0&&!c.has(l.layer_id))throw new Error(`${m}.layer_id referenziert keine vorhandene Raumebene.`);j(l.visible,`${m}.visible`),b(l.width_m,`${m}.width_m`,!0),l.measurements!==void 0&&$t(l.measurements,`${m}.measurements`)}),ye(e.notes,"building.notes").forEach((l,u)=>T(l,`building.notes[${u}]`))}function K(){return{type:"custom:hausklima-card",title:"HausKlima",show_dimensions:!0,show_room_names:!0}}function G(n){let e=$(n,"Konfiguration");if(e.type!=="custom:hausklima-card")throw new Error("type muss custom:hausklima-card sein.");if(e.title!==void 0&&typeof e.title!="string")throw new Error("title muss eine Zeichenfolge sein.");return e.show_dimensions!==void 0&&j(e.show_dimensions,"show_dimensions"),e.show_room_names!==void 0&&j(e.show_room_names,"show_room_names"),e.building!==void 0&&xt(e.building),structuredClone({...K(),...e})}function ie(n){return n.building?structuredClone(n.building):qe()}var we=x(()=>{"use strict";Ze();xe()});var Je={};nt(Je,{HausKlimaCardEditor:()=>se});var se,Qe=x(()=>{"use strict";ee();we();se=class extends v{constructor(){super(...arguments);this._config=K()}static{this.properties={hass:{attribute:!1},_config:{state:!0}}}setConfig(t){this._config=G(t)}updateConfig(t,s){let i=G({...this._config,[t]:s});this._config=i,this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:i},bubbles:!0,composed:!0}))}render(){return f`
      <div class="editor">
        <div class="intro">
          <span class="eyebrow">HausKlima Card</span>
          <h2>Darstellung</h2>
          <p>Die Hausansicht an dein Dashboard anpassen.</p>
        </div>

        <label class="title-field" for="title">
          <span>Titel</span>
          <input
            id="title"
            type="text"
            .value=${this._config.title??""}
            @change=${t=>this.updateConfig("title",t.target.value)}
          />
        </label>

        <fieldset>
          <legend>Hausansicht</legend>
          <label class="option" for="show-room-names">
            <span>
              <span class="option-title">Raumnamen anzeigen</span>
              <span class="description">Räume direkt in der Gebäudeansicht beschriften.</span>
            </span>
            <input
              id="show-room-names"
              type="checkbox"
              .checked=${this._config.show_room_names??!0}
              @change=${t=>this.updateConfig("show_room_names",t.target.checked)}
            />
          </label>
          <label class="option" for="show-dimensions">
            <span>
              <span class="option-title">Maße anzeigen</span>
              <span class="description">Bekannte Maße und den ungefähren Garagenabstand einblenden.</span>
            </span>
            <input
              id="show-dimensions"
              type="checkbox"
              .checked=${this._config.show_dimensions??!0}
              @change=${t=>this.updateConfig("show_dimensions",t.target.checked)}
            />
          </label>
        </fieldset>

        <aside aria-label="Entwicklungsstand">
          <strong>Phase 1 · Projektgrundlage</strong>
          <p>
            Gebäude und Räume bleiben bei diesen Änderungen erhalten. Die grafische
            Raum- und Sensorverwaltung folgt in einer späteren Phase.
          </p>
        </aside>
      </div>
    `}static{this.styles=U`
    :host {
      display: block;
      color: var(--primary-text-color, #24353a);
      font-family: var(--paper-font-body1_-_font-family, inherit);
    }

    * {
      box-sizing: border-box;
    }

    .editor {
      display: grid;
      gap: 24px;
      padding: 8px 0 16px;
    }

    .eyebrow {
      color: var(--secondary-text-color, #687b81);
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    h2 {
      margin: 6px 0;
      font-size: 22px;
      font-weight: 600;
    }

    p {
      margin: 0;
      color: var(--secondary-text-color, #687b81);
      font-size: 14px;
      line-height: 1.55;
    }

    .title-field {
      display: grid;
      gap: 8px;
      font-size: 14px;
      font-weight: 500;
    }

    input[type='text'] {
      width: 100%;
      min-height: 48px;
      border: 1px solid var(--divider-color, #dce4e5);
      border-radius: 10px;
      padding: 12px 14px;
      background: var(--input-fill-color, var(--card-background-color, #fff));
      color: var(--primary-text-color, #24353a);
      font: inherit;
    }

    input:focus-visible {
      outline: 2px solid var(--primary-color, #2b8279);
      outline-offset: 3px;
    }

    fieldset {
      min-width: 0;
      margin: 0;
      padding: 0;
      border: 0;
    }

    legend {
      margin-bottom: 6px;
      padding: 0;
      color: var(--secondary-text-color, #687b81);
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }

    .option {
      display: flex;
      gap: 20px;
      align-items: center;
      justify-content: space-between;
      min-height: 76px;
      padding: 14px 0;
      border-bottom: 1px solid var(--divider-color, #dce4e5);
      cursor: pointer;
    }

    .option-title,
    .description {
      display: block;
    }

    .option-title {
      font-size: 15px;
      font-weight: 500;
    }

    .description {
      margin-top: 5px;
      color: var(--secondary-text-color, #687b81);
      font-size: 13px;
      line-height: 1.4;
    }

    input[type='checkbox'] {
      flex: 0 0 auto;
      width: 22px;
      height: 22px;
      margin: 0 3px;
      accent-color: var(--primary-color, #2b8279);
      cursor: pointer;
    }

    aside {
      border-radius: 12px;
      padding: 16px;
      background: var(--secondary-background-color, #f1f5f4);
    }

    aside strong {
      display: block;
      margin-bottom: 6px;
      font-size: 13px;
      font-weight: 600;
    }
  `}};customElements.get("hausklima-card-editor")||customElements.define("hausklima-card-editor",se)});ee();we();function ke(n){let i=n.roof.interior_ridge_height_m*40,r=(n.levels.find(g=>g.id==="ground_floor")?.clear_height_m??0)*40,o=(n.levels.find(g=>g.id==="basement")?.clear_height_m??0)*40,h=86+i,d=h+r,a=d+o,c=n.house.width_m*40,l=94+c+n.garage.gap_m*40,u=n.garage.width_m*40,m=n.garage.height_m*40,_=n.layers[0]?.id,re=[],et=[{id:"attic",name:"DG",y:86,height:i,building:"house",width:c,x:94},{id:"ground_floor",name:"EG",y:h,height:r,building:"house",width:c,x:94},{id:"basement",name:"KG",y:d,height:o,building:"house",width:c,x:94},{id:"garage",name:"",y:d-m,height:m,building:"garage",width:u,x:l}].map(g=>{let z=0;for(let Se of n.rooms.filter(P=>P.level_id===g.id&&P.visible&&(!P.layer_id||P.layer_id===_))){if(n.levels.find(it=>it.id===g.id)?.building_id!==g.building)break;let V=(Se.width_m??0)*40;if(V<=0||z+V>g.width+.001||g.height===0)break;re.push({room:Se,x:g.x+z,y:g.y,width:V,height:g.height,level:g.id}),z+=V}return{...g,remaining:g.width-z,filled:z}}),Ce=Math.min(0,d-m-64),tt=new Set(re.map(g=>g.room.id));return{x:94,roofTop:86,atticHeight:i,groundTop:h,groundY:d,basementBottom:a,houseWidth:c,garageX:l,garageWidth:u,garageHeight:m,shapes:re,bands:et,otherRooms:n.rooms.filter(g=>!tt.has(g.id)),minY:Ce,width:l+u+64,height:Math.max(a,d)+80-Ce}}xe();var vt={temperature:"Temperatur",relative_humidity:"Relative Luftfeuchtigkeit",absolute_humidity:"Absolute Luftfeuchtigkeit",co2:"CO\u2082",voc:"VOC"},yt={temperature:"\xB0C",relative_humidity:"%",absolute_humidity:"g/m\xB3",co2:"ppm",voc:""};function wt(n,e,t,s){let i=s?.states[n.entity],r=i?i.state==="unavailable"?"unavailable":i.state==="unknown"?"unknown":"available":"missing",o=i?.attributes.friendly_name,h=i?.attributes.unit_of_measurement;return{entity:n.entity,name:n.name??(typeof o=="string"?o:n.entity),value:r==="available"?i.state:null,unit:typeof h=="string"?h:yt[e],status:r,is_primary:n.entity===t}}function F(n,e){return te.flatMap(t=>{let s=n.measurements?.[t];if(!s||s.visible===!1||s.sensors.length===0)return[];let i=s.primary??s.sensors[0].entity,r=s.sensors.map(h=>wt(h,t,i,e)),o=r.find(h=>h.is_primary)??r[0];return[{type:t,label:vt[t],primary:o,sensors:r,...s.position?{position:s.position}:{}}]})}ee();var Xe=U`
  :host {
    display: block;
    --hk-ink: var(--primary-text-color, #293d42);
    --hk-muted: var(--secondary-text-color, #687d82);
    --hk-line: var(--divider-color, #dae4e4);
    --hk-paper: var(--ha-card-background, var(--card-background-color, #fff));
    --hk-accent: var(--primary-color, #26766b);
    color: var(--hk-ink);
    font-family: var(--paper-font-body1_-_font-family, system-ui, sans-serif);
  }
  * { box-sizing: border-box; }
  ha-card {
    display: block;
    overflow: hidden;
    background: var(--hk-paper);
    border: var(--ha-card-border-width, 1px) solid var(--ha-card-border-color, var(--hk-line));
    border-radius: var(--ha-card-border-radius, 20px);
    box-shadow: var(--ha-card-box-shadow, 0 4px 24px #1d444407);
  }
  header { padding: 28px 30px 18px; display: flex; align-items: center; justify-content: space-between; gap: 16px; }
  .eyebrow { color: var(--hk-muted); font-size: 10px; font-weight: 650; letter-spacing: .14em; }
  .brand-mark { font-size: 19px; color: var(--hk-accent); margin-right: 4px; }
  h1 { font-size: 27px; font-weight: 600; line-height: 1.3; letter-spacing: -.035em; margin: 10px 0 4px; }
  .subtitle { margin: 0; font-size: 13px; color: var(--hk-muted); }
  .view-badge { display: flex; align-items: center; gap: 7px; font-size: 11px; padding: 9px 12px; border: 1px solid var(--hk-line); border-radius: 20px; white-space: nowrap; }
  .view-badge span { width: 6px; height: 6px; background: var(--hk-accent); border-radius: 50%; }
  .building-meta { padding: 5px 30px 0; color: var(--hk-muted); font-size: 11px; display: flex; gap: 9px; }
  .dot { opacity: .65; }
  .drawing-scroll { overflow-x: auto; padding: 12px 14px 0; background: linear-gradient(180deg, transparent, color-mix(in srgb, var(--hk-accent) 2%, transparent)); }
  .building { width: 100%; min-width: 670px; display: block; }
  .building text { fill: var(--hk-ink); font-family: inherit; pointer-events: none; }
  .building-caption { fill: var(--hk-muted) !important; font-size: 11px; letter-spacing: 2px; font-weight: 600; }
  .floor-outline { stroke: color-mix(in srgb, var(--hk-ink) 55%, var(--hk-paper)); stroke-width: 3; fill: var(--hk-paper); }
  .room { cursor: pointer; outline: none; }
  .room-fill { fill: color-mix(in srgb, #86b5b2 15%, var(--hk-paper)); stroke: color-mix(in srgb, var(--hk-ink) 40%, var(--hk-paper)); stroke-width: 1.8; }
  .ground_floor .room-fill { fill: color-mix(in srgb, #adb99b 15%, var(--hk-paper)); }
  .attic .room-fill { fill: color-mix(in srgb, #d7c5a6 19%, var(--hk-paper)); }
  .garage .room-fill { fill: color-mix(in srgb, #a5b2c1 13%, var(--hk-paper)); }
  .room:hover .room-fill, .room:focus-visible .room-fill, .room.selected .room-fill { fill: color-mix(in srgb, var(--hk-accent) 19%, var(--hk-paper)); stroke: var(--hk-accent); stroke-width: 3; }
  .room-name { font-size: 13px; font-weight: 550; }
  .room-width { fill: var(--hk-muted) !important; font-size: 11px; }
  .level-label { fill: var(--hk-muted) !important; font-size: 11px; font-weight: 600; }
  .roof-plane { fill: color-mix(in srgb, var(--hk-ink) 16%, var(--hk-paper)); stroke: var(--hk-muted); stroke-width: 1.5; }
  .ridge { stroke: var(--hk-ink); stroke-width: 3; fill: none; }
  .cutaway-line { stroke: var(--hk-muted); stroke-width: 1; stroke-dasharray: 5 5; opacity: .55; pointer-events: none; }
  .cutaway-caption { fill: var(--hk-muted) !important; font-size: 8px; letter-spacing: 1.2px; }
  .dimension-line, .gap-line { stroke: var(--hk-muted); stroke-width: 1; fill: none; opacity: .6; }
  .gap-line { stroke-dasharray: 4 4; }
  .dimension-label { fill: var(--hk-muted) !important; font-size: 10px; }
  .ground-line { fill: none; stroke: var(--hk-muted); stroke-width: 1; opacity: .4; pointer-events: none; }
  .hatch-line { stroke: var(--hk-muted); stroke-width: 1; opacity: .3; }
  .sensor-available { fill: var(--hk-accent); }
  .sensor-unavailable { fill: var(--warning-color, #bd7e28); }
  .drawing-note { display: flex; align-items: center; gap: 8px; padding: 4px 30px 22px; color: var(--hk-muted); font-size: 10px; line-height: 1.5; background: color-mix(in srgb, var(--hk-accent) 2%, transparent); }
  .hatch-key { width: 13px; height: 13px; flex-shrink: 0; border: 1px solid var(--hk-line); background: repeating-linear-gradient(125deg, transparent, transparent 3px, var(--hk-line) 3px, var(--hk-line) 4px); }
  footer { border-top: 1px solid var(--hk-line); padding: 16px 30px; font-size: 11px; line-height: 1.6; color: var(--hk-muted); display: flex; align-items: center; gap: 9px; }
  .status-dot { width: 6px; height: 6px; background: var(--hk-muted); border-radius: 50%; flex-shrink: 0; opacity: .5; }
  button { color: inherit; font: inherit; cursor: pointer; }
  button:focus-visible, .drawing-scroll:focus-visible { outline: 2px solid var(--hk-accent); outline-offset: -3px; }
  .room-detail, .other-rooms { padding: 22px 30px; border-top: 1px solid var(--hk-line); }
  .room-detail p { margin: 12px 0 0; font-size: 13px; color: var(--hk-muted); }
  h2 { font-size: 17px; font-weight: 600; margin: 5px 0; }
  .detail-header { display: flex; align-items: center; justify-content: space-between; }
  .close-detail { border: 0; background: transparent; padding: 4px 10px; font-size: 26px; color: var(--hk-muted); }
  .room-list { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
  .room-list button { border: 1px solid var(--hk-line); border-radius: 10px; background: var(--hk-paper); padding: 9px 13px; }
  .climate-summary { padding: 16px 24px; border-top: 1px solid var(--hk-line); display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 9px; }
  .summary-room { display: flex; flex-direction: column; align-items: flex-start; gap: 9px; padding: 12px; border: 1px solid var(--hk-line); border-radius: 12px; background: transparent; text-align: left; font-size: 12px; }
  .room-values { display: flex; gap: 7px; flex-wrap: wrap; }
  .reading { font-size: 14px; font-weight: 600; }
  .unavailable { color: var(--warning-color, #a36e1f); }
  .metric-list { display: grid; gap: 16px; margin-top: 20px; }
  .metric-group h3 { color: var(--hk-muted); font-size: 11px; font-weight: 500; margin: 0 0 7px; }
  .sensor-row { width: 100%; display: flex; align-items: center; justify-content: space-between; gap: 12px; text-align: left; background: transparent; border: none; border-top: 1px solid var(--hk-line); padding: 10px 0; font-size: 13px; }
  .sensor-row small { display: block; color: var(--hk-muted); font-size: 10px; margin-top: 3px; }
  @media (max-width: 600px) {
    header { padding: 22px 20px 16px; align-items: flex-start; }
    h1 { font-size: 23px; }
    .view-badge { font-size: 0; padding: 10px; gap: 0; margin-top: 8px; }
    .building-meta { padding-left: 20px; font-size: 10px; }
    .drawing-scroll { padding-left: 0; padding-right: 0; }
    .drawing-note { padding-left: 20px; padding-right: 20px; }
    footer, .room-detail, .other-rooms { padding-left: 20px; padding-right: 20px; }
  }
`;var y=n=>n.toLocaleString("de-DE",{maximumFractionDigits:2,minimumFractionDigits:2}),kt=0,Ae=class extends v{constructor(){super(...arguments);this.patternId=`hausklima-open-${++kt}`}static{this.properties={hass:{attribute:!1},_config:{state:!0},_selected:{state:!0}}}setConfig(t){this._config=G(t),ie(this._config).rooms.some(s=>s.id===this._selected)||(this._selected=void 0)}static async getConfigElement(){return await Promise.resolve().then(()=>(Qe(),Je)),document.createElement("hausklima-card-editor")}static getStubConfig(){let{type:t,...s}=K();return s}getCardSize(){if(!this._config)return 8;let t=ke(ie(this._config)),s=Math.max(670,this.clientWidth-28);return Math.ceil((t.height/t.width*s+240)/50)}getGridOptions(){return{columns:12,rows:"auto",min_columns:6}}selectRoom(t){this._selected=this._selected===t.id?void 0:t.id}sensorText(t){return t.status==="missing"?"Entit\xE4t fehlt":t.status==="unknown"?"Unbekannt":t.status==="unavailable"?"Nicht verf\xFCgbar":`${t.value}${t.unit?` ${t.unit}`:""}`}renderRoom(t){let{room:s,x:i,y:r,width:o,height:h,level:d}=t,a=o<70,c=F(s,this.hass),l=this._selected===s.id,u=i+o/2,m=r+h/2;return k`
      <g class="room ${d} ${l?"selected":""}" data-room-id=${s.id}
        role="button" tabindex="0" aria-label=${s.name} aria-pressed=${String(l)}
        @click=${()=>this.selectRoom(s)}
        @keydown=${_=>{(_.key==="Enter"||_.key===" ")&&(_.preventDefault(),this.selectRoom(s))}}>
        <title>${s.name}${s.width_m!==null?` \xB7 ${y(s.width_m)} m`:""}</title>
        <rect class="room-fill" x=${i} y=${r} width=${o} height=${h} />
        ${this._config?.show_room_names?k`
          <text class="room-name" text-anchor="middle" x=${u} y=${m-(a?0:4)}
            transform=${a?`rotate(-90 ${u} ${m})`:""}>${s.name}</text>
        `:p}
        ${this._config?.show_dimensions&&!a?k`
          <text class="room-width" text-anchor="middle" x=${u} y=${m+18}>${y(s.width_m)} m</text>
        `:p}
        ${c.length?k`
          <g class="sensor-marker" transform="translate(${i+o-13}, ${r+12})">
            <circle r="4" class=${c.some(_=>_.primary.status!=="available")?"sensor-unavailable":"sensor-available"} />
            <title>${c.map(_=>`${_.label}: ${this.sensorText(_.primary)}`).join(", ")}</title>
          </g>
        `:p}
      </g>
    `}renderMeasurementSummary(t){let s=F(t,this.hass);return s.length?f`<span class="room-values">${s.map(i=>f`
      <span class=${i.primary.status==="available"?"reading":"reading unavailable"}
        title=${i.label}>${this.sensorText(i.primary)}</span>
    `)}</span>`:p}render(){if(!this._config)return p;let t=this._config,s=ie(t),i=ke(s),r=s.rooms.find(a=>a.id===this._selected),o=r?F(r,this.hass):[],h=s.rooms.filter(a=>F(a,this.hass).length),d=`${s.garage.gap_is_approximate?"ca. ":""}${y(s.garage.gap_m)} m Abstand`;return f`
      <ha-card>
        <header>
          <div><div class="eyebrow"><span class="brand-mark" aria-hidden="true">⌂</span> HAUSKLIMA</div>
            ${t.title?f`<h1>${t.title}</h1>`:p}
            <p class="subtitle">Das Zuhause auf einen Blick</p>
          </div>
          <span class="view-badge"><span aria-hidden="true"></span> Gebäudeübersicht</span>
        </header>
        <div class="building-meta">
          <span>${s.rooms.length} Räume</span><span class="dot" aria-hidden="true">·</span>
          <span>Traufansicht mit Dachausschnitt</span>
        </div>
        <div class="drawing-scroll" tabindex="0" role="region" aria-label="Gebäudeansicht; auf schmalen Bildschirmen horizontal scrollbar">
          <svg class="building" viewBox="0 ${i.minY} ${i.width} ${i.height}" xmlns="http://www.w3.org/2000/svg"
            aria-label="Schematische Traufansicht: Keller, Erdgeschoss, geöffnetes Dachgeschoss und freistehende Garage">
            <defs>
              <pattern id=${this.patternId} width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
                <line x1="0" y1="0" x2="0" y2="7" class="hatch-line" />
              </pattern>
            </defs>
            <text class="building-caption" x=${i.x} y="27">WOHNHAUS</text>
            <text class="building-caption" x=${i.garageX} y=${i.groundY-i.garageHeight-30}>GARAGE</text>
            <!-- Symbolic receding far roof: the ridge and eave remain parallel. -->
            <path class="roof-plane" d="M ${i.x} ${i.roofTop} h ${i.houseWidth} l 28 26 h -${i.houseWidth} Z" />
            ${i.bands.map(a=>k`
              <rect class="floor-outline" x=${a.x} y=${a.y} width=${a.width} height=${a.height} />
              ${a.remaining>.001?k`<rect class="unresolved-band" data-unresolved-level=${a.id}
                x=${a.x+a.filled} y=${a.y} width=${a.remaining} height=${a.height}
                fill="url(#${this.patternId})"><title>Nicht zugeordnete Breite: ${y(a.remaining/40)} m. Wandzuordnung offen.</title></rect>`:p}
              ${a.name?k`<text class="level-label" x=${i.x-21} y=${a.y+a.height/2+4} text-anchor="end">${a.name}</text>`:p}
            `)}
            ${i.shapes.map(a=>this.renderRoom(a))}
            <path class="ridge" d="M ${i.x} ${i.roofTop} h ${i.houseWidth}" />
            <path class="cutaway-line" d="M ${i.x} ${i.groundTop-s.roof.knee_wall_height_m*40} h ${i.houseWidth}" />
            <text class="cutaway-caption" x=${i.x+12} y=${i.roofTop+23}>DACHFLÄCHE GEÖFFNET</text>
            ${t.show_dimensions?k`
              <text class="dimension-label" text-anchor="end" x=${i.x+i.houseWidth} y=${i.roofTop-14}>First innen ${y(s.roof.interior_ridge_height_m)} m</text>
              <text class="dimension-label" x=${i.x+12} y=${i.groundTop-s.roof.knee_wall_height_m*40-8}>Kniestock ${y(s.roof.knee_wall_height_m)} m</text>
              <path class="dimension-line" d="M ${i.x} ${i.basementBottom+26} v 10 m 0 -5 h ${i.houseWidth} m 0 -5 v 10" />
              <text class="dimension-label" text-anchor="middle" x=${i.x+i.houseWidth/2} y=${i.basementBottom+57}>${y(s.house.width_m)} m Traufseite</text>
              <path class="gap-line" d="M ${i.x+i.houseWidth+14} ${i.groundY+30} h ${s.garage.gap_m*40-28}" />
              <text class="dimension-label" text-anchor="middle" x=${(i.x+i.houseWidth+i.garageX)/2} y=${i.groundY+53}>${d}</text>
              <text class="dimension-label" text-anchor="middle" x=${i.garageX+i.garageWidth/2} y=${i.groundY+30}>${y(s.garage.width_m)} × ${y(s.garage.depth_m)} m · H ${y(s.garage.height_m)} m</text>
            `:p}
            <path class="ground-line" d="M ${i.x-18} ${i.groundY} h ${i.width-i.x-20}" />
          </svg>
        </div>
        <div class="drawing-note"><span class="hatch-key" aria-hidden="true"></span>
          <span>Schraffur: Breite noch nicht zugeordnet · Wand- und Dachdetails offen</span>
        </div>
        ${h.length?f`<div class="climate-summary" aria-label="Konfigurierte Messorte">
          ${h.map(a=>f`<button class="summary-room" @click=${()=>this.selectRoom(a)}>
            <span>${a.name}</span>${this.renderMeasurementSummary(a)}
          </button>`)}
        </div>`:p}
        ${i.otherRooms.length?f`<section class="other-rooms" aria-label="Weitere Räume">
          <h2>Weitere Räume</h2><div class="room-list">
          ${i.otherRooms.map(a=>f`<button @click=${()=>this.selectRoom(a)} aria-pressed=${String(a.id===this._selected)}>${a.name}</button>`)}
          </div>
        </section>`:p}
        ${r?f`<section class="room-detail" aria-label="Raumdetails" aria-live="polite">
          <div class="detail-header"><div><span class="eyebrow">${s.levels.find(a=>a.id===r.level_id)?.name}</span>
          <h2>${r.name}</h2></div><button class="close-detail" @click=${()=>{this._selected=void 0}} aria-label="Raumdetails schließen">×</button></div>
          ${o.length?f`<div class="metric-list">${o.map(a=>f`
            <div class="metric-group"><h3>${a.label}</h3>${a.sensors.map(c=>f`
              <button class="sensor-row" @click=${()=>this.dispatchEvent(new CustomEvent("hass-more-info",{detail:{entityId:c.entity},bubbles:!0,composed:!0}))}>
                <span>${c.name}${c.is_primary?f`<small>Hauptsensor</small>`:p}</span>
                <strong class=${c.status!=="available"?"unavailable":""}>${this.sensorText(c)}</strong>
              </button>`)}
            </div>`)}
          </div>`:f`<p>Für diesen Raum sind noch keine sichtbaren Sensoren zugeordnet.</p>`}
        </section>`:f`<footer><span class="status-dot" aria-hidden="true"></span>
          ${h.length?"Raum ausw\xE4hlen, um alle zugeordneten Sensoren zu sehen.":"Noch keine Sensoren zugeordnet. Raum ausw\xE4hlen, um Details zu \xF6ffnen."}
        </footer>`}
      </ha-card>
    `}static{this.styles=Xe}};customElements.get("hausklima-card")||customElements.define("hausklima-card",Ae);var Ee=window;Ee.customCards??=[];Ee.customCards.some(n=>n.type==="hausklima-card")||Ee.customCards.push({type:"hausklima-card",name:"HausKlima Card",description:"R\xE4umliche Hausklima\xFCbersicht mit schematischer Geb\xE4udeansicht.",preview:!0});
