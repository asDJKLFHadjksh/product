"use strict";

const $ = (s,root=document) => root.querySelector(s);
const $$ = (s,root=document) => Array.from(root.querySelectorAll(s));
const state = {products: [], activeDoc: "overview"};
const FALLBACK_DATA = {
  products:[{
    id:"ez-guys",name:"EZ Guys Complete",subtitle:"Adobe Premiere Pro workflow toolkit",
    description:"A toolkit for creating reusable clip packs, aligning and distributing selected clips, and fitting the active sequence.",
    status:"In development",platform:"Adobe Premiere Pro",minVersion:"25.6",technology:"UXP",
    media:{mode:"none",youtubeId:"",screenshots:[]},purchaseUrl:"",
    features:[{title:"RCP Library",description:"Reusable clip packs across projects."},{title:"Align",description:"Six directional alignment operations."},{title:"Distribute",description:"Eight distribution operations."},{title:"Sequence Fit",description:"Fit sequence framing using Source or Bounds."}],
    docs:[{id:"overview",title:"Overview",category:"Introduction",summary:"Product overview.",blocks:[{type:"paragraph",text:"EZ Guys is a toolkit for Adobe Premiere Pro."}]}]
  }]
};
function esc(value){return String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function getProduct(id="ez-guys"){return state.products.find(p=>p.id===id)||state.products[0];}
function route(){
  const raw=(location.hash||"#home").slice(1);
  const [page,slug]=raw.split("/");
  const view = page==="product"?"product":page==="docs"?"docs":"home";
  for(const id of ["home","product","docs"]) $("#view-"+id).hidden = id!==view;
  $$(".nav a[data-nav]").forEach(a=>a.classList.toggle("active",a.dataset.nav===view||(a.dataset.nav==="products"&&view==="product")));
  if(view==="product") renderProduct(getProduct(slug));
  if(view==="docs") renderDocs(slug||state.activeDoc);
  if(view==="home"&&page==="products"){requestAnimationFrame(()=>$("#products").scrollIntoView({block:"start"}));}
  else window.scrollTo({top:0,behavior:"instant"});
  const menu=$("#main-nav"); menu.classList.remove("open");$("#menu-toggle").setAttribute("aria-expanded","false");
  document.title=view==="product"?getProduct(slug).name+" — KuhyaKuya":view==="docs"?"Documentation — KuhyaKuya":"KuhyaKuya — Products & Documentation";
}
function renderHome(){
  $("#product-list").innerHTML=state.products.map(p=>'<a class="product-card" href="#product/'+encodeURIComponent(p.id)+'"><div class="product-card-art"><div class="art-mini"><span>KUHYAKUYA / CREATIVE TOOL</span><span>↗</span></div><div class="watermark">EZ.</div><div class="art-mini"><span>Adobe Premiere Pro</span><span>UXP</span></div></div><div class="product-card-info"><div class="product-card-top"><span class="tag">'+esc(p.status)+'</span><span class="text-arrow">Explore ↗</span></div><h3>'+esc(p.name)+'</h3><p>'+esc(p.description)+'</p><span class="text-arrow">Explore product <span aria-hidden="true">→</span></span></div></a>').join("")+'<div class="coming-card"><div class="big-plus">+</div><h3>More to come.</h3><p>More tools may join the collection. No announcements just yet.</p></div>';
  const p=state.products[0];
  const icons=["◫","⊞","☷","⤢"];
  $("#feature-list").innerHTML=p.features.map((f,i)=>'<div class="feature-card"><div class="feature-symbol">'+icons[i%icons.length]+'</div><h3>'+esc(f.title)+'</h3><p>'+esc(f.description)+'</p></div>').join("");
}
function validYoutubeId(id){return /^[a-zA-Z0-9_-]{11}$/.test(id||"");}
function safeMediaPath(path){
  if(typeof path!=="string")return "";
  const p=path.trim();
  if(!p||/^(?:javascript|data|vbscript):/i.test(p))return "";
  if(/^https:\/\//i.test(p))return p;
  if(p.startsWith("//")||p.startsWith("/")||p.includes(".."))return "";
  return /^[a-zA-Z0-9_./-]+$/.test(p) ? p : "";
}
function renderMedia(media){
  const m=media||{};const mode=m.mode||"none";
  const imgs=Array.isArray(m.screenshots)?m.screenshots.map(safeMediaPath).filter(Boolean):[];
  const showVideo=(mode==="video"||mode==="both")&&validYoutubeId(m.youtubeId);
  const showImages=(mode==="screenshots"||mode==="video"||mode==="both")&&imgs.length;
  if(!showVideo&&!showImages)return '<div class="media-gallery"><div class="empty-media"><div>Product visuals are coming soon.<br><small>Video or screenshot previews will appear here when available.</small></div></div></div>';
  let out='<div class="media-gallery">';
  if(showVideo){const id=m.youtubeId;out+='<button class="video-launch" type="button" data-video="'+esc(id)+'" aria-label="Play YouTube product demo"><span class="play-icon" aria-hidden="true">▶</span><small>Watch product demo on YouTube</small></button>';}
  if(showImages)out+='<div class="gallery-thumbs">'+imgs.map((src,i)=>'<a href="'+esc(src)+'" target="_blank" rel="noopener noreferrer" class="gallery-image" aria-label="Open screenshot '+(i+1)+'"><img src="'+esc(src)+'" alt="Product screenshot '+(i+1)+'" loading="lazy"></a>').join("")+'</div>';
  out+='</div>';return out;
}
function renderProduct(p){
  if(!p)return;
  const target=$("#product-content");
  target.innerHTML='<div class="product-hero"><div><span class="eyebrow">PRODUCT / '+esc(p.status).toUpperCase()+'</span><h1>'+esc(p.name)+'<span class="accent">.</span></h1><p>'+esc(p.description)+'</p><div class="product-meta"><span class="meta-chip">'+esc(p.platform)+'</span><span class="meta-chip">Premiere '+esc(p.minVersion)+'+</span><span class="meta-chip">'+esc(p.technology)+'</span></div></div><div class="product-hero-visual"><span>EZ.</span></div></div>'+
  '<section class="content-section" aria-labelledby="showcase-heading"><h2 class="content-heading" id="showcase-heading">See it in action.</h2><p class="content-desc">A look at the tool and its creative workflow.</p>'+renderMedia(p.media)+'</section>'+
  '<section class="content-section" aria-labelledby="capabilities-heading"><h2 class="content-heading" id="capabilities-heading">What’s inside.</h2><p class="content-desc">Focused tools designed to make common editing tasks easier to manage.</p><div class="capabilities">'+p.features.map((f,i)=>'<div class="capability"><div class="number">0'+(i+1)+'</div><h3>'+esc(f.title)+'</h3><p>'+esc(f.description)+'</p></div>').join("")+'</div></section>'+
  '<div class="product-action-bar"><div><h2 class="content-heading">Find your workflow.</h2><p>Learn how the tools work, review the current controls, and explore the documentation.</p></div><a href="#docs/overview" class="button button-primary">Read documentation ↗</a></div>';
  const videoButton=$("[data-video]",target);
  if(videoButton)videoButton.addEventListener("click",()=>{
    const id=videoButton.dataset.video;
    if(!validYoutubeId(id))return;
    const wrap=document.createElement("div");wrap.className="video-embed";
    const iframe=document.createElement("iframe");
    iframe.src="https://www.youtube-nocookie.com/embed/"+id+"?autoplay=1";
    iframe.title="Product demo video";iframe.allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";iframe.allowFullscreen=true;iframe.referrerPolicy="strict-origin-when-cross-origin";
    wrap.append(iframe);videoButton.replaceWith(wrap);
  });
}
function renderDocBlock(block){
  switch(block.type){
    case "paragraph":return "<p>"+esc(block.text)+"</p>";
    case "heading":return "<h3>"+esc(block.text)+"</h3>";
    case "list":return "<ul>"+(block.items||[]).map(x=>"<li>"+esc(x)+"</li>").join("")+"</ul>";
    case "note":return '<div class="doc-note">'+esc(block.text)+"</div>";
    default:return "";
  }
}
function renderDocs(slug){
  const p=getProduct();
  const docs=p.docs||[];
  const search=$("#docs-search");
  const chosen=docs.find(d=>d.id===slug)||docs[0];
  state.activeDoc=chosen.id;
  const searchTerm=search.value.trim().toLowerCase();
  const matching=docs.filter(d=>[d.title,d.summary,d.category].some(v=>String(v||"").toLowerCase().includes(searchTerm)));
  $("#docs-nav").innerHTML=matching.length?matching.map(d=>'<a href="#docs/'+encodeURIComponent(d.id)+'" class="'+(d.id===chosen.id?"active":"")+'">'+esc(d.title)+'</a>').join(""):'<p class="doc-empty">No matching topics.</p>';
  $("#docs-article").innerHTML='<span class="doc-eyebrow">'+esc(chosen.category).toUpperCase()+' / EZ GUYS</span><h2>'+esc(chosen.title)+'</h2><p>'+esc(chosen.summary)+'</p>'+(chosen.blocks||[]).map(renderDocBlock).join("")+'<div class="doc-note">Documentation preview. Details may change before the public release.</div>';
}
async function boot(){
  let data=FALLBACK_DATA;
  try{const response=await fetch("./products.json",{cache:"no-store"});if(!response.ok)throw new Error("Product data unavailable");const json=await response.json();if(!Array.isArray(json.products)||!json.products.length)throw new Error("Product data invalid");data=json;}catch(error){console.warn("Using built-in catalog fallback:",error);}
  state.products=data.products;
  $("#year").textContent=new Date().getFullYear();
  renderHome();
  $("#docs-search").addEventListener("input",()=>renderDocs(state.activeDoc));
  $("#menu-toggle").addEventListener("click",()=>{const nav=$("#main-nav");const opened=nav.classList.toggle("open");$("#menu-toggle").setAttribute("aria-expanded",String(opened));});
  window.addEventListener("hashchange",route);
  route();
}
document.addEventListener("DOMContentLoaded",boot);
