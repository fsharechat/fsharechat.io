(window.webpackJsonp=window.webpackJsonp||[]).push([[42],{114:function(e,t,r){"use strict";r.r(t),r.d(t,"frontMatter",(function(){return c})),r.d(t,"metadata",(function(){return s})),r.d(t,"rightToc",(function(){return i})),r.d(t,"default",(function(){return b}));var n=r(2),o=r(6),a=(r(0),r(218)),c={title:"SQL execution order",sidebar_label:"SQL execution order",description:"Execution order for SQL clauses in QuestDB. This covers the SQL keywords you are used to as well as QuestDB's extensions to the language."},s={unversionedId:"concept/sql-execution-order",id:"concept/sql-execution-order",isDocsHomePage:!1,title:"SQL execution order",description:"Execution order for SQL clauses in QuestDB. This covers the SQL keywords you are used to as well as QuestDB's extensions to the language.",source:"@site/docs/concept/sql-execution-order.md",slug:"/concept/sql-execution-order",permalink:"/docs/concept/sql-execution-order",version:"current",sidebar_label:"SQL execution order",sidebar:"docs",previous:{title:"Timestamp function",permalink:"/docs/reference/function/timestamp"},next:{title:"Data types",permalink:"/docs/reference/sql/datatypes"}},i=[],l={rightToc:i};function b(e){var t=e.components,r=Object(o.a)(e,["components"]);return Object(a.b)("wrapper",Object(n.a)({},l,r,{components:t,mdxType:"MDXLayout"}),Object(a.b)("p",null,"QuestDB attempts to implement standard ANSI SQL. We also attempt to be\nPostgreSQL compatible, although some of it is work in progress. QuestDB\nimplements the following clauses in this execution order:"),Object(a.b)("ol",null,Object(a.b)("li",{parentName:"ol"},Object(a.b)("a",Object(n.a)({parentName:"li"},{href:"/docs/reference/sql/select/"}),"FROM")),Object(a.b)("li",{parentName:"ol"},Object(a.b)("a",Object(n.a)({parentName:"li"},{href:"/docs/reference/sql/join/"}),"ON")),Object(a.b)("li",{parentName:"ol"},Object(a.b)("a",Object(n.a)({parentName:"li"},{href:"/docs/reference/sql/join/"}),"JOIN")),Object(a.b)("li",{parentName:"ol"},Object(a.b)("a",Object(n.a)({parentName:"li"},{href:"/docs/reference/sql/where/"}),"WHERE")),Object(a.b)("li",{parentName:"ol"},Object(a.b)("a",Object(n.a)({parentName:"li"},{href:"/docs/reference/sql/latest-by/"}),"LATEST BY")),Object(a.b)("li",{parentName:"ol"},Object(a.b)("a",Object(n.a)({parentName:"li"},{href:"/docs/reference/sql/group-by/"}),"GROUP BY")," (optional)"),Object(a.b)("li",{parentName:"ol"},Object(a.b)("a",Object(n.a)({parentName:"li"},{href:"/docs/reference/sql/with/"}),"WITH")),Object(a.b)("li",{parentName:"ol"},Object(a.b)("a",Object(n.a)({parentName:"li"},{href:"/docs/concept/sql-extensions#implicit-having/"}),"HAVING")," (implicit)"),Object(a.b)("li",{parentName:"ol"},Object(a.b)("a",Object(n.a)({parentName:"li"},{href:"/docs/reference/sql/select/"}),"SELECT")),Object(a.b)("li",{parentName:"ol"},Object(a.b)("a",Object(n.a)({parentName:"li"},{href:"/docs/reference/sql/distinct/"}),"DISTINCT")),Object(a.b)("li",{parentName:"ol"},Object(a.b)("a",Object(n.a)({parentName:"li"},{href:"/docs/reference/sql/order-by/"}),"ORDER BY")),Object(a.b)("li",{parentName:"ol"},Object(a.b)("a",Object(n.a)({parentName:"li"},{href:"/docs/reference/sql/limit/"}),"LIMIT"))),Object(a.b)("p",null,"We also implemented sub-queries. They can be used anywhere table name is used.\nOur sub-query implementation adds virtually zero execution cost to SQL. We\nencourage their use as they add flavours of functional language to old-school\nSQL."))}b.isMDXComponent=!0}}]);