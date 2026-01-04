"use strict";(()=>{var e={};e.id=1920,e.ids=[1920],e.modules={53524:e=>{e.exports=require("@prisma/client")},20399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},30517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},11350:(e,r,t)=>{t.r(r),t.d(r,{originalPathname:()=>O,patchFetch:()=>I,requestAsyncStorage:()=>h,routeModule:()=>g,serverHooks:()=>N,staticGenerationAsyncStorage:()=>f});var a={};t.r(a),t.d(a,{GET:()=>m});var i=t(49303),o=t(88716),s=t(60670),d=t(87070),n=t(72331),l=t(46643);let c="catalog:filters",u=(e,r=0)=>{if(null==e)return r;if("number"==typeof e)return Number.isFinite(e)?e:r;let t=Number(e);return Number.isFinite(t)?t:r};async function p(e=n.Z){let r=l.Q.get(c);if(r)return r;let[t,a,i,o,s]=await Promise.all([e.brand.findMany({select:{id:!0,name:!0,slug:!0},orderBy:{name:"asc"}}),e.category.findMany({select:{id:!0,name:!0,slug:!0},orderBy:{name:"asc"}}),e.product.aggregate({_min:{price:!0},_max:{price:!0}}),e.$queryRaw`
      SELECT c."id", c."name", COUNT(*)::int AS orders
      FROM "OrderItem" oi
      JOIN "Order" o ON o."id" = oi."orderId" AND o."createdAt" >= NOW() - INTERVAL '30 days'
      JOIN "Product" p ON p."id" = oi."productId"
      LEFT JOIN "Category" c ON c."id" = p."categoryId"
      WHERE c."id" IS NOT NULL
      GROUP BY c."id", c."name"
      ORDER BY orders DESC
      LIMIT 5
    `,e.$queryRaw`
      SELECT b."id", b."name", COUNT(*)::int AS orders
      FROM "OrderItem" oi
      JOIN "Order" o ON o."id" = oi."orderId" AND o."createdAt" >= NOW() - INTERVAL '30 days'
      JOIN "Product" p ON p."id" = oi."productId"
      LEFT JOIN "Brand" b ON b."id" = p."brandId"
      WHERE b."id" IS NOT NULL
      GROUP BY b."id", b."name"
      ORDER BY orders DESC
      LIMIT 5
    `]),d=u(i._min.price,0),p=u(i._max.price,d),m={brands:t.map(e=>({id:e.id,name:e.name,slug:e.slug})),categories:a.map(e=>({id:e.id,name:e.name,slug:e.slug})),priceRange:{min:d,max:p},popularFilters:{categories:o.filter(e=>!!e.id).map(e=>({id:e.id,name:e.name,orders:e.orders})),brands:s.filter(e=>!!e.id).map(e=>({id:e.id,name:e.name,orders:e.orders}))}};return l.Q.set(c,m,6e4),m}async function m(){try{let e=await p(n.Z);return d.NextResponse.json({data:e})}catch(e){return console.error("[catalog/filters] failed",e),d.NextResponse.json({error:"Failed to load filters"},{status:500})}}let g=new i.AppRouteRouteModule({definition:{kind:o.x.APP_ROUTE,page:"/api/catalog/filters/route",pathname:"/api/catalog/filters",filename:"route",bundlePath:"app/api/catalog/filters/route"},resolvedPagePath:"/Users/ernestoponce/dev/azteka-dsd/app/api/catalog/filters/route.ts",nextConfigOutput:"",userland:a}),{requestAsyncStorage:h,staticGenerationAsyncStorage:f,serverHooks:N}=g,O="/api/catalog/filters/route";function I(){return(0,s.patchFetch)({serverHooks:N,staticGenerationAsyncStorage:f})}},46643:(e,r,t)=>{t.d(r,{Q:()=>o});class a{constructor(e){this.key=e}}class i{constructor(e=200){this.maxSize=e,this.store=new Map,this.order=new Map}get(e){let r=this.store.get(e);if(r){if(Date.now()>r.expiresAt){this.delete(e);return}return this.touch(e),r.value}}set(e,r,t=6e4){let a=Date.now()+t;this.store.set(e,{value:r,expiresAt:a}),this.touch(e),this.evictIfNeeded()}delete(e){this.store.delete(e),this.order.delete(e)}clear(){this.store.clear(),this.order.clear()}touch(e){this.order.has(e)&&this.order.delete(e),this.order.set(e,new a(e))}evictIfNeeded(){for(;this.order.size>this.maxSize;){let e=this.order.keys().next().value;if(!e)break;this.order.delete(e),this.store.delete(e)}}}let o=global.__catalogCache__??new i("undefined"!=typeof process?500:200);global.__catalogCache__||(global.__catalogCache__=o)},72331:(e,r,t)=>{t.d(r,{Z:()=>o,_:()=>i});var a=t(53524);let i=global.prisma??new a.PrismaClient,o=i}};var r=require("../../../../webpack-runtime.js");r.C(e);var t=e=>r(r.s=e),a=r.X(0,[9276,5972],()=>t(11350));module.exports=a})();