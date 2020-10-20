(window.webpackJsonp=window.webpackJsonp||[]).push([[49],{121:function(e,t,a){"use strict";a.r(t),a.d(t,"frontMatter",(function(){return b})),a.d(t,"metadata",(function(){return g})),a.d(t,"rightToc",(function(){return s})),a.d(t,"default",(function(){return I}));var i=a(2),n=a(6),c=(a(0),a(218)),b={title:"SELECT keyword",sidebar_label:"SELECT",description:"SELECT SQL keyword reference documentation."},g={unversionedId:"reference/sql/select",id:"reference/sql/select",isDocsHomePage:!1,title:"SELECT keyword",description:"SELECT SQL keyword reference documentation.",source:"@site/docs/reference/sql/select.md",slug:"/reference/sql/select",permalink:"/docs/reference/sql/select",version:"current",sidebar_label:"SELECT",sidebar:"docs",previous:{title:"SAMPLE BY keyword",permalink:"/docs/reference/sql/sample-by"},next:{title:"SHOW keyword",permalink:"/docs/reference/sql/show"}},s=[{value:"Syntax",id:"syntax",children:[]},{value:"Simple select",id:"simple-select",children:[{value:"All columns",id:"all-columns",children:[]},{value:"Specific columns",id:"specific-columns",children:[]},{value:"Arithmetic expressions",id:"arithmetic-expressions",children:[]},{value:"Aliases",id:"aliases",children:[]}]},{value:"Aggregation",id:"aggregation",children:[{value:"Aggregation by group",id:"aggregation-by-group",children:[]},{value:"Aggregation arithmetic",id:"aggregation-arithmetic",children:[]}]},{value:"Supported clauses",id:"supported-clauses",children:[{value:"CASE",id:"case",children:[]},{value:"CAST",id:"cast",children:[]},{value:"DISTINCT",id:"distinct",children:[]},{value:"FILL",id:"fill",children:[]},{value:"JOIN",id:"join",children:[]},{value:"LIMIT",id:"limit",children:[]},{value:"ORDER BY",id:"order-by",children:[]},{value:"UNION",id:"union",children:[]},{value:"WHERE",id:"where",children:[]}]},{value:"Additional time series clauses",id:"additional-time-series-clauses",children:[{value:"LATEST BY",id:"latest-by",children:[]},{value:"SAMPLE BY",id:"sample-by",children:[]},{value:"TIMESTAMP",id:"timestamp",children:[]}]}],o={rightToc:s};function I(e){var t=e.components,b=Object(n.a)(e,["components"]);return Object(c.b)("wrapper",Object(i.a)({},o,b,{components:t,mdxType:"MDXLayout"}),Object(c.b)("p",null,Object(c.b)("inlineCode",{parentName:"p"},"SELECT")," allows you to specify list of columns and expressions to be selected\nand evaluated from a table."),Object(c.b)("h2",{id:"syntax"},"Syntax"),Object(c.b)("p",null,Object(c.b)("img",{alt:"Flow chart showing the syntax of the SELECT keyword",src:a(328).default})),Object(c.b)("div",{className:"admonition admonition-tip alert alert--success"},Object(c.b)("div",Object(i.a)({parentName:"div"},{className:"admonition-heading"}),Object(c.b)("h5",{parentName:"div"},Object(c.b)("span",Object(i.a)({parentName:"h5"},{className:"admonition-icon"}),Object(c.b)("svg",Object(i.a)({parentName:"span"},{xmlns:"http://www.w3.org/2000/svg",width:"12",height:"16",viewBox:"0 0 12 16"}),Object(c.b)("path",Object(i.a)({parentName:"svg"},{fillRule:"evenodd",d:"M6.5 0C3.48 0 1 2.19 1 5c0 .92.55 2.25 1 3 1.34 2.25 1.78 2.78 2 4v1h5v-1c.22-1.22.66-1.75 2-4 .45-.75 1-2.08 1-3 0-2.81-2.48-5-5.5-5zm3.64 7.48c-.25.44-.47.8-.67 1.11-.86 1.41-1.25 2.06-1.45 3.23-.02.05-.02.11-.02.17H5c0-.06 0-.13-.02-.17-.2-1.17-.59-1.83-1.45-3.23-.2-.31-.42-.67-.67-1.11C2.44 6.78 2 5.65 2 5c0-2.2 2.02-4 4.5-4 1.22 0 2.36.42 3.22 1.19C10.55 2.94 11 3.94 11 5c0 .66-.44 1.78-.86 2.48zM4 14h5c-.23 1.14-1.3 2-2.5 2s-2.27-.86-2.5-2z"})))),"tip")),Object(c.b)("div",Object(i.a)({parentName:"div"},{className:"admonition-content"}),Object(c.b)("p",{parentName:"div"},"The ",Object(c.b)("inlineCode",{parentName:"p"},"TABLE")," can either be a in your database (in which case you would pass the\ntable's name), or the result of a sub query."))),Object(c.b)("h2",{id:"simple-select"},"Simple select"),Object(c.b)("h3",{id:"all-columns"},"All columns"),Object(c.b)("p",null,"QuestDB supports ",Object(c.b)("inlineCode",{parentName:"p"},"SELECT * FROM tablename"),". When selecting all, you can also\nomit most of the statement and pass the table name."),Object(c.b)("p",null,"The two examples below are equivalent"),Object(c.b)("pre",null,Object(c.b)("code",Object(i.a)({parentName:"pre"},{className:"language-questdb-sql",metastring:'title="QuestDB dialect"',title:'"QuestDB','dialect"':!0}),"ratings;\n")),Object(c.b)("pre",null,Object(c.b)("code",Object(i.a)({parentName:"pre"},{className:"language-questdb-sql",metastring:'title="Traditional SQL equivalent"',title:'"Traditional',SQL:!0,'equivalent"':!0}),"SELECT * FROM ratings;\n")),Object(c.b)("h3",{id:"specific-columns"},"Specific columns"),Object(c.b)("p",null,"To select specific columns, replace ","*"," by the names of the columns you are\ninterested in."),Object(c.b)("p",null,"Example:"),Object(c.b)("pre",null,Object(c.b)("code",Object(i.a)({parentName:"pre"},{className:"language-questdb-sql"}),"SELECT movieId, rating FROM ratings;\n")),Object(c.b)("h3",{id:"arithmetic-expressions"},"Arithmetic expressions"),Object(c.b)("p",null,Object(c.b)("inlineCode",{parentName:"p"},"SELECT")," is capable of evaluating multiple expressions and functions. You can\nmix comma separated lists of expressions with the column names you are\nselecting."),Object(c.b)("pre",null,Object(c.b)("code",Object(i.a)({parentName:"pre"},{className:"language-questdb-sql"}),"SELECT movieId, (100 - rating)*2, rating > 3.5 good\nFROM ratings;\n")),Object(c.b)("p",null,"The result of ",Object(c.b)("inlineCode",{parentName:"p"},"rating > 3.5")," is a boolean. The column will be named good and\ntake values true or false."),Object(c.b)("h3",{id:"aliases"},"Aliases"),Object(c.b)("p",null,"Using aliases allow you to give expressions or column names of your choice. You\ncan assign an alias to a column or an expression by writing the alias name you\nwant after that expression"),Object(c.b)("div",{className:"admonition admonition-note alert alert--secondary"},Object(c.b)("div",Object(i.a)({parentName:"div"},{className:"admonition-heading"}),Object(c.b)("h5",{parentName:"div"},Object(c.b)("span",Object(i.a)({parentName:"h5"},{className:"admonition-icon"}),Object(c.b)("svg",Object(i.a)({parentName:"span"},{xmlns:"http://www.w3.org/2000/svg",width:"14",height:"16",viewBox:"0 0 14 16"}),Object(c.b)("path",Object(i.a)({parentName:"svg"},{fillRule:"evenodd",d:"M6.3 5.69a.942.942 0 0 1-.28-.7c0-.28.09-.52.28-.7.19-.18.42-.28.7-.28.28 0 .52.09.7.28.18.19.28.42.28.7 0 .28-.09.52-.28.7a1 1 0 0 1-.7.3c-.28 0-.52-.11-.7-.3zM8 7.99c-.02-.25-.11-.48-.31-.69-.2-.19-.42-.3-.69-.31H6c-.27.02-.48.13-.69.31-.2.2-.3.44-.31.69h1v3c.02.27.11.5.31.69.2.2.42.31.69.31h1c.27 0 .48-.11.69-.31.2-.19.3-.42.31-.69H8V7.98v.01zM7 2.3c-3.14 0-5.7 2.54-5.7 5.68 0 3.14 2.56 5.7 5.7 5.7s5.7-2.55 5.7-5.7c0-3.15-2.56-5.69-5.7-5.69v.01zM7 .98c3.86 0 7 3.14 7 7s-3.14 7-7 7-7-3.12-7-7 3.14-7 7-7z"})))),"note")),Object(c.b)("div",Object(i.a)({parentName:"div"},{className:"admonition-content"}),Object(c.b)("p",{parentName:"div"},"Alias names and column names must be unique."))),Object(c.b)("pre",null,Object(c.b)("code",Object(i.a)({parentName:"pre"},{className:"language-questdb-sql"}),"SELECT movieId alias1, rating alias2\nFROM ratings\n")),Object(c.b)("h2",{id:"aggregation"},"Aggregation"),Object(c.b)("div",{className:"admonition admonition-info alert alert--info"},Object(c.b)("div",Object(i.a)({parentName:"div"},{className:"admonition-heading"}),Object(c.b)("h5",{parentName:"div"},Object(c.b)("span",Object(i.a)({parentName:"h5"},{className:"admonition-icon"}),Object(c.b)("svg",Object(i.a)({parentName:"span"},{xmlns:"http://www.w3.org/2000/svg",width:"14",height:"16",viewBox:"0 0 14 16"}),Object(c.b)("path",Object(i.a)({parentName:"svg"},{fillRule:"evenodd",d:"M7 2.3c3.14 0 5.7 2.56 5.7 5.7s-2.56 5.7-5.7 5.7A5.71 5.71 0 0 1 1.3 8c0-3.14 2.56-5.7 5.7-5.7zM7 1C3.14 1 0 4.14 0 8s3.14 7 7 7 7-3.14 7-7-3.14-7-7-7zm1 3H6v5h2V4zm0 6H6v2h2v-2z"})))),"info")),Object(c.b)("div",Object(i.a)({parentName:"div"},{className:"admonition-content"}),Object(c.b)("p",{parentName:"div"},"Supported aggregation functions are listed on the\n",Object(c.b)("a",Object(i.a)({parentName:"p"},{href:"/docs/reference/function/aggregation/"}),"aggregation reference"),"."))),Object(c.b)("h3",{id:"aggregation-by-group"},"Aggregation by group"),Object(c.b)("p",null,"QuestDB evaluates aggregation functions without need for traditional ",Object(c.b)("inlineCode",{parentName:"p"},"GROUP BY"),".\nUse a mix of column names and aggregation functions in a ",Object(c.b)("inlineCode",{parentName:"p"},"SELECT")," clause. You\ncan have any number of discrete value columns and any number of aggregation\nfunctions."),Object(c.b)("pre",null,Object(c.b)("code",Object(i.a)({parentName:"pre"},{className:"language-questdb-sql",metastring:'title="QuestDB dialect"',title:'"QuestDB','dialect"':!0}),"SELECT movieId, avg(rating), count()\nFROM ratings;\n")),Object(c.b)("pre",null,Object(c.b)("code",Object(i.a)({parentName:"pre"},{className:"language-questdb-sql",metastring:'title="Traditional SQL equivalent"',title:'"Traditional',SQL:!0,'equivalent"':!0}),"SELECT movieId, avg(rating), count()\nFROM ratings\nGROUP BY movieId;\n")),Object(c.b)("h3",{id:"aggregation-arithmetic"},"Aggregation arithmetic"),Object(c.b)("p",null,"Aggregation functions can be used in arithmetic expressions. The following\ncomputes ",Object(c.b)("inlineCode",{parentName:"p"},"mid")," of rating values for every movie."),Object(c.b)("pre",null,Object(c.b)("code",Object(i.a)({parentName:"pre"},{className:"language-questdb-sql"}),"SELECT movieId, (min(rating) + max(rating))/2 mid, count() count\nFROM ratings;\n")),Object(c.b)("div",{className:"admonition admonition-tip alert alert--success"},Object(c.b)("div",Object(i.a)({parentName:"div"},{className:"admonition-heading"}),Object(c.b)("h5",{parentName:"div"},Object(c.b)("span",Object(i.a)({parentName:"h5"},{className:"admonition-icon"}),Object(c.b)("svg",Object(i.a)({parentName:"span"},{xmlns:"http://www.w3.org/2000/svg",width:"12",height:"16",viewBox:"0 0 12 16"}),Object(c.b)("path",Object(i.a)({parentName:"svg"},{fillRule:"evenodd",d:"M6.5 0C3.48 0 1 2.19 1 5c0 .92.55 2.25 1 3 1.34 2.25 1.78 2.78 2 4v1h5v-1c.22-1.22.66-1.75 2-4 .45-.75 1-2.08 1-3 0-2.81-2.48-5-5.5-5zm3.64 7.48c-.25.44-.47.8-.67 1.11-.86 1.41-1.25 2.06-1.45 3.23-.02.05-.02.11-.02.17H5c0-.06 0-.13-.02-.17-.2-1.17-.59-1.83-1.45-3.23-.2-.31-.42-.67-.67-1.11C2.44 6.78 2 5.65 2 5c0-2.2 2.02-4 4.5-4 1.22 0 2.36.42 3.22 1.19C10.55 2.94 11 3.94 11 5c0 .66-.44 1.78-.86 2.48zM4 14h5c-.23 1.14-1.3 2-2.5 2s-2.27-.86-2.5-2z"})))),"tip")),Object(c.b)("div",Object(i.a)({parentName:"div"},{className:"admonition-content"}),Object(c.b)("p",{parentName:"div"},"Whenever possible, it is recommended to perform arithmetic ",Object(c.b)("inlineCode",{parentName:"p"},"outside")," of\naggregation functions as this can have a dramatic impact on performance. For\nexample, ",Object(c.b)("inlineCode",{parentName:"p"},"min(value/2)")," is going to execute considerably slower than\n",Object(c.b)("inlineCode",{parentName:"p"},"min(value)/2")," although both alternative will return the same result"))),Object(c.b)("h2",{id:"supported-clauses"},"Supported clauses"),Object(c.b)("p",null,"QuestDB supports the following standard SQL clauses within SELECT statements."),Object(c.b)("h3",{id:"case"},"CASE"),Object(c.b)("p",null,"Conditional results based on expressions."),Object(c.b)("h4",{id:"syntax-1"},"Syntax"),Object(c.b)("p",null,Object(c.b)("img",{alt:"Flow chart showing the syntax of CASE",src:a(237).default})),Object(c.b)("div",{className:"admonition admonition-info alert alert--info"},Object(c.b)("div",Object(i.a)({parentName:"div"},{className:"admonition-heading"}),Object(c.b)("h5",{parentName:"div"},Object(c.b)("span",Object(i.a)({parentName:"h5"},{className:"admonition-icon"}),Object(c.b)("svg",Object(i.a)({parentName:"span"},{xmlns:"http://www.w3.org/2000/svg",width:"14",height:"16",viewBox:"0 0 14 16"}),Object(c.b)("path",Object(i.a)({parentName:"svg"},{fillRule:"evenodd",d:"M7 2.3c3.14 0 5.7 2.56 5.7 5.7s-2.56 5.7-5.7 5.7A5.71 5.71 0 0 1 1.3 8c0-3.14 2.56-5.7 5.7-5.7zM7 1C3.14 1 0 4.14 0 8s3.14 7 7 7 7-3.14 7-7-3.14-7-7-7zm1 3H6v5h2V4zm0 6H6v2h2v-2z"})))),"info")),Object(c.b)("div",Object(i.a)({parentName:"div"},{className:"admonition-content"}),Object(c.b)("p",{parentName:"div"},"For more information, please refer to the\n",Object(c.b)("a",Object(i.a)({parentName:"p"},{href:"/docs/reference/sql/case/"}),"CASE reference")))),Object(c.b)("h3",{id:"cast"},"CAST"),Object(c.b)("p",null,"Convert values and expression between types."),Object(c.b)("h4",{id:"syntax-2"},"Syntax"),Object(c.b)("p",null,Object(c.b)("img",{alt:"Flow chart showing the syntax of the CAST keyword",src:a(263).default})),Object(c.b)("div",{className:"admonition admonition-info alert alert--info"},Object(c.b)("div",Object(i.a)({parentName:"div"},{className:"admonition-heading"}),Object(c.b)("h5",{parentName:"div"},Object(c.b)("span",Object(i.a)({parentName:"h5"},{className:"admonition-icon"}),Object(c.b)("svg",Object(i.a)({parentName:"span"},{xmlns:"http://www.w3.org/2000/svg",width:"14",height:"16",viewBox:"0 0 14 16"}),Object(c.b)("path",Object(i.a)({parentName:"svg"},{fillRule:"evenodd",d:"M7 2.3c3.14 0 5.7 2.56 5.7 5.7s-2.56 5.7-5.7 5.7A5.71 5.71 0 0 1 1.3 8c0-3.14 2.56-5.7 5.7-5.7zM7 1C3.14 1 0 4.14 0 8s3.14 7 7 7 7-3.14 7-7-3.14-7-7-7zm1 3H6v5h2V4zm0 6H6v2h2v-2z"})))),"info")),Object(c.b)("div",Object(i.a)({parentName:"div"},{className:"admonition-content"}),Object(c.b)("p",{parentName:"div"},"For more information, please refer to the\n",Object(c.b)("a",Object(i.a)({parentName:"p"},{href:"/docs/reference/sql/cast/"}),"CAST reference")))),Object(c.b)("h3",{id:"distinct"},"DISTINCT"),Object(c.b)("p",null,"Returns distinct values of the specified column(s)."),Object(c.b)("h4",{id:"syntax-3"},"Syntax"),Object(c.b)("p",null,Object(c.b)("img",{alt:"Flow chart showing the syntax of the DISTINCT keyword",src:a(264).default})),Object(c.b)("div",{className:"admonition admonition-info alert alert--info"},Object(c.b)("div",Object(i.a)({parentName:"div"},{className:"admonition-heading"}),Object(c.b)("h5",{parentName:"div"},Object(c.b)("span",Object(i.a)({parentName:"h5"},{className:"admonition-icon"}),Object(c.b)("svg",Object(i.a)({parentName:"span"},{xmlns:"http://www.w3.org/2000/svg",width:"14",height:"16",viewBox:"0 0 14 16"}),Object(c.b)("path",Object(i.a)({parentName:"svg"},{fillRule:"evenodd",d:"M7 2.3c3.14 0 5.7 2.56 5.7 5.7s-2.56 5.7-5.7 5.7A5.71 5.71 0 0 1 1.3 8c0-3.14 2.56-5.7 5.7-5.7zM7 1C3.14 1 0 4.14 0 8s3.14 7 7 7 7-3.14 7-7-3.14-7-7-7zm1 3H6v5h2V4zm0 6H6v2h2v-2z"})))),"info")),Object(c.b)("div",Object(i.a)({parentName:"div"},{className:"admonition-content"}),Object(c.b)("p",{parentName:"div"},"For more information, please refer to the\n",Object(c.b)("a",Object(i.a)({parentName:"p"},{href:"/docs/reference/sql/distinct/"}),"DISTINCT reference"),"."))),Object(c.b)("h3",{id:"fill"},"FILL"),Object(c.b)("p",null,"Defines filling strategy for missing data in aggregation queries. This function\ncomplements ",Object(c.b)("a",Object(i.a)({parentName:"p"},{href:"/docs/reference/sql/sample-by/"}),"SAMPLE BY")," queries."),Object(c.b)("h4",{id:"syntax-4"},"Syntax"),Object(c.b)("p",null,Object(c.b)("img",{alt:"Flow chart showing the syntax of the FILL keyword",src:a(265).default})),Object(c.b)("div",{className:"admonition admonition-info alert alert--info"},Object(c.b)("div",Object(i.a)({parentName:"div"},{className:"admonition-heading"}),Object(c.b)("h5",{parentName:"div"},Object(c.b)("span",Object(i.a)({parentName:"h5"},{className:"admonition-icon"}),Object(c.b)("svg",Object(i.a)({parentName:"span"},{xmlns:"http://www.w3.org/2000/svg",width:"14",height:"16",viewBox:"0 0 14 16"}),Object(c.b)("path",Object(i.a)({parentName:"svg"},{fillRule:"evenodd",d:"M7 2.3c3.14 0 5.7 2.56 5.7 5.7s-2.56 5.7-5.7 5.7A5.71 5.71 0 0 1 1.3 8c0-3.14 2.56-5.7 5.7-5.7zM7 1C3.14 1 0 4.14 0 8s3.14 7 7 7 7-3.14 7-7-3.14-7-7-7zm1 3H6v5h2V4zm0 6H6v2h2v-2z"})))),"info")),Object(c.b)("div",Object(i.a)({parentName:"div"},{className:"admonition-content"}),Object(c.b)("p",{parentName:"div"},"For more information, please refer to the\n",Object(c.b)("a",Object(i.a)({parentName:"p"},{href:"/docs/reference/sql/fill/"}),"FILL reference"),"."))),Object(c.b)("h3",{id:"join"},"JOIN"),Object(c.b)("p",null,"Join tables based on a key or timestamp."),Object(c.b)("h4",{id:"syntax-5"},"Syntax"),Object(c.b)("p",null,Object(c.b)("img",{alt:"Flow chart showing the syntax of the JOIN keyword",src:a(262).default})),Object(c.b)("div",{className:"admonition admonition-info alert alert--info"},Object(c.b)("div",Object(i.a)({parentName:"div"},{className:"admonition-heading"}),Object(c.b)("h5",{parentName:"div"},Object(c.b)("span",Object(i.a)({parentName:"h5"},{className:"admonition-icon"}),Object(c.b)("svg",Object(i.a)({parentName:"span"},{xmlns:"http://www.w3.org/2000/svg",width:"14",height:"16",viewBox:"0 0 14 16"}),Object(c.b)("path",Object(i.a)({parentName:"svg"},{fillRule:"evenodd",d:"M7 2.3c3.14 0 5.7 2.56 5.7 5.7s-2.56 5.7-5.7 5.7A5.71 5.71 0 0 1 1.3 8c0-3.14 2.56-5.7 5.7-5.7zM7 1C3.14 1 0 4.14 0 8s3.14 7 7 7 7-3.14 7-7-3.14-7-7-7zm1 3H6v5h2V4zm0 6H6v2h2v-2z"})))),"info")),Object(c.b)("div",Object(i.a)({parentName:"div"},{className:"admonition-content"}),Object(c.b)("p",{parentName:"div"},"For more information, please refer to the\n",Object(c.b)("a",Object(i.a)({parentName:"p"},{href:"/docs/reference/sql/join/"}),"JOIN reference")))),Object(c.b)("h3",{id:"limit"},"LIMIT"),Object(c.b)("p",null,"Specify the number and position of records returned by a query."),Object(c.b)("h4",{id:"syntax-6"},"Syntax"),Object(c.b)("p",null,Object(c.b)("img",{alt:"Flow chart showing the syntax of the LIMIT keyword",src:a(266).default})),Object(c.b)("div",{className:"admonition admonition-info alert alert--info"},Object(c.b)("div",Object(i.a)({parentName:"div"},{className:"admonition-heading"}),Object(c.b)("h5",{parentName:"div"},Object(c.b)("span",Object(i.a)({parentName:"h5"},{className:"admonition-icon"}),Object(c.b)("svg",Object(i.a)({parentName:"span"},{xmlns:"http://www.w3.org/2000/svg",width:"14",height:"16",viewBox:"0 0 14 16"}),Object(c.b)("path",Object(i.a)({parentName:"svg"},{fillRule:"evenodd",d:"M7 2.3c3.14 0 5.7 2.56 5.7 5.7s-2.56 5.7-5.7 5.7A5.71 5.71 0 0 1 1.3 8c0-3.14 2.56-5.7 5.7-5.7zM7 1C3.14 1 0 4.14 0 8s3.14 7 7 7 7-3.14 7-7-3.14-7-7-7zm1 3H6v5h2V4zm0 6H6v2h2v-2z"})))),"info")),Object(c.b)("div",Object(i.a)({parentName:"div"},{className:"admonition-content"}),Object(c.b)("p",{parentName:"div"},"For more information, please refer to the\n",Object(c.b)("a",Object(i.a)({parentName:"p"},{href:"/docs/reference/sql/limit/"}),"LIMIT reference"),"."))),Object(c.b)("h3",{id:"order-by"},"ORDER BY"),Object(c.b)("p",null,"Orders the results of a query by one or several columns."),Object(c.b)("h4",{id:"syntax-7"},"Syntax"),Object(c.b)("p",null,Object(c.b)("img",{alt:"Flow chart showing the syntax of the ORDER BY keyword",src:a(267).default})),Object(c.b)("div",{className:"admonition admonition-info alert alert--info"},Object(c.b)("div",Object(i.a)({parentName:"div"},{className:"admonition-heading"}),Object(c.b)("h5",{parentName:"div"},Object(c.b)("span",Object(i.a)({parentName:"h5"},{className:"admonition-icon"}),Object(c.b)("svg",Object(i.a)({parentName:"span"},{xmlns:"http://www.w3.org/2000/svg",width:"14",height:"16",viewBox:"0 0 14 16"}),Object(c.b)("path",Object(i.a)({parentName:"svg"},{fillRule:"evenodd",d:"M7 2.3c3.14 0 5.7 2.56 5.7 5.7s-2.56 5.7-5.7 5.7A5.71 5.71 0 0 1 1.3 8c0-3.14 2.56-5.7 5.7-5.7zM7 1C3.14 1 0 4.14 0 8s3.14 7 7 7 7-3.14 7-7-3.14-7-7-7zm1 3H6v5h2V4zm0 6H6v2h2v-2z"})))),"info")),Object(c.b)("div",Object(i.a)({parentName:"div"},{className:"admonition-content"}),Object(c.b)("p",{parentName:"div"},"For more information, please refer to the\n",Object(c.b)("a",Object(i.a)({parentName:"p"},{href:"/docs/reference/sql/order-by/"}),"ORDER BY reference")))),Object(c.b)("h3",{id:"union"},"UNION"),Object(c.b)("p",null,"Combine the results of two or more select statements. Can include or ignore\nduplicates."),Object(c.b)("h4",{id:"syntax-8"},"Syntax"),Object(c.b)("p",null,Object(c.b)("img",{alt:"Flow chart showing the syntax of the UNION keyword",src:a(268).default})),Object(c.b)("div",{className:"admonition admonition-info alert alert--info"},Object(c.b)("div",Object(i.a)({parentName:"div"},{className:"admonition-heading"}),Object(c.b)("h5",{parentName:"div"},Object(c.b)("span",Object(i.a)({parentName:"h5"},{className:"admonition-icon"}),Object(c.b)("svg",Object(i.a)({parentName:"span"},{xmlns:"http://www.w3.org/2000/svg",width:"14",height:"16",viewBox:"0 0 14 16"}),Object(c.b)("path",Object(i.a)({parentName:"svg"},{fillRule:"evenodd",d:"M7 2.3c3.14 0 5.7 2.56 5.7 5.7s-2.56 5.7-5.7 5.7A5.71 5.71 0 0 1 1.3 8c0-3.14 2.56-5.7 5.7-5.7zM7 1C3.14 1 0 4.14 0 8s3.14 7 7 7 7-3.14 7-7-3.14-7-7-7zm1 3H6v5h2V4zm0 6H6v2h2v-2z"})))),"info")),Object(c.b)("div",Object(i.a)({parentName:"div"},{className:"admonition-content"}),Object(c.b)("p",{parentName:"div"},"For more information, please refer to the\n",Object(c.b)("a",Object(i.a)({parentName:"p"},{href:"/docs/reference/sql/union/"}),"UNION reference")))),Object(c.b)("h3",{id:"where"},"WHERE"),Object(c.b)("p",null,"Filters query results"),Object(c.b)("h4",{id:"syntax-9"},"Syntax"),Object(c.b)("p",null,Object(c.b)("img",{alt:"Flow chart showing the syntax of the WHERE clause",src:a(252).default})),Object(c.b)("div",{className:"admonition admonition-info alert alert--info"},Object(c.b)("div",Object(i.a)({parentName:"div"},{className:"admonition-heading"}),Object(c.b)("h5",{parentName:"div"},Object(c.b)("span",Object(i.a)({parentName:"h5"},{className:"admonition-icon"}),Object(c.b)("svg",Object(i.a)({parentName:"span"},{xmlns:"http://www.w3.org/2000/svg",width:"14",height:"16",viewBox:"0 0 14 16"}),Object(c.b)("path",Object(i.a)({parentName:"svg"},{fillRule:"evenodd",d:"M7 2.3c3.14 0 5.7 2.56 5.7 5.7s-2.56 5.7-5.7 5.7A5.71 5.71 0 0 1 1.3 8c0-3.14 2.56-5.7 5.7-5.7zM7 1C3.14 1 0 4.14 0 8s3.14 7 7 7 7-3.14 7-7-3.14-7-7-7zm1 3H6v5h2V4zm0 6H6v2h2v-2z"})))),"info")),Object(c.b)("div",Object(i.a)({parentName:"div"},{className:"admonition-content"}),Object(c.b)("p",{parentName:"div"},"QuestDB supports complex WHERE clauses along with type-specific searches. For\nmore information, please refer to the\n",Object(c.b)("a",Object(i.a)({parentName:"p"},{href:"/docs/reference/sql/where/"}),"WHERE reference"),". There are different syntaxes for\n",Object(c.b)("a",Object(i.a)({parentName:"p"},{href:"/docs/reference/sql/where/#symbol-and-string"}),"text"),",\n",Object(c.b)("a",Object(i.a)({parentName:"p"},{href:"/docs/reference/sql/where/#numeric"}),"numeric"),", or\n",Object(c.b)("a",Object(i.a)({parentName:"p"},{href:"/docs/reference/sql/where/#timestamp-and-date"}),"timestamp")," filters."))),Object(c.b)("h2",{id:"additional-time-series-clauses"},"Additional time series clauses"),Object(c.b)("p",null,"QuestDB augments SQL with the following clauses."),Object(c.b)("h3",{id:"latest-by"},"LATEST BY"),Object(c.b)("p",null,"Retrieves the latest entry by timestamp for a given key or combination of keys\nThis function requires a\n",Object(c.b)("a",Object(i.a)({parentName:"p"},{href:"/docs/concept/designated-timestamp/"}),"designated timestamp"),"."),Object(c.b)("h4",{id:"syntax-10"},"Syntax"),Object(c.b)("p",null,Object(c.b)("img",{alt:"Flow chart showing the syntax of the LATEST BY keyword",src:a(253).default})),Object(c.b)("div",{className:"admonition admonition-info alert alert--info"},Object(c.b)("div",Object(i.a)({parentName:"div"},{className:"admonition-heading"}),Object(c.b)("h5",{parentName:"div"},Object(c.b)("span",Object(i.a)({parentName:"h5"},{className:"admonition-icon"}),Object(c.b)("svg",Object(i.a)({parentName:"span"},{xmlns:"http://www.w3.org/2000/svg",width:"14",height:"16",viewBox:"0 0 14 16"}),Object(c.b)("path",Object(i.a)({parentName:"svg"},{fillRule:"evenodd",d:"M7 2.3c3.14 0 5.7 2.56 5.7 5.7s-2.56 5.7-5.7 5.7A5.71 5.71 0 0 1 1.3 8c0-3.14 2.56-5.7 5.7-5.7zM7 1C3.14 1 0 4.14 0 8s3.14 7 7 7 7-3.14 7-7-3.14-7-7-7zm1 3H6v5h2V4zm0 6H6v2h2v-2z"})))),"info")),Object(c.b)("div",Object(i.a)({parentName:"div"},{className:"admonition-content"}),Object(c.b)("p",{parentName:"div"},"For more information, please refer to the\n",Object(c.b)("a",Object(i.a)({parentName:"p"},{href:"/docs/reference/sql/latest-by/"}),"LATEST BY reference"),"."))),Object(c.b)("h3",{id:"sample-by"},"SAMPLE BY"),Object(c.b)("p",null,"Aggregates time series data into homogeneous time chunks. For example daily\naverage, monthly maximum etc. This function requires a\n",Object(c.b)("a",Object(i.a)({parentName:"p"},{href:"/docs/concept/designated-timestamp/"}),"designated timestamp"),"."),Object(c.b)("h4",{id:"syntax-11"},"Syntax"),Object(c.b)("p",null,Object(c.b)("img",{alt:"Flow chart showing the syntax of the SAMPLE BY keyword",src:a(269).default})),Object(c.b)("div",{className:"admonition admonition-info alert alert--info"},Object(c.b)("div",Object(i.a)({parentName:"div"},{className:"admonition-heading"}),Object(c.b)("h5",{parentName:"div"},Object(c.b)("span",Object(i.a)({parentName:"h5"},{className:"admonition-icon"}),Object(c.b)("svg",Object(i.a)({parentName:"span"},{xmlns:"http://www.w3.org/2000/svg",width:"14",height:"16",viewBox:"0 0 14 16"}),Object(c.b)("path",Object(i.a)({parentName:"svg"},{fillRule:"evenodd",d:"M7 2.3c3.14 0 5.7 2.56 5.7 5.7s-2.56 5.7-5.7 5.7A5.71 5.71 0 0 1 1.3 8c0-3.14 2.56-5.7 5.7-5.7zM7 1C3.14 1 0 4.14 0 8s3.14 7 7 7 7-3.14 7-7-3.14-7-7-7zm1 3H6v5h2V4zm0 6H6v2h2v-2z"})))),"info")),Object(c.b)("div",Object(i.a)({parentName:"div"},{className:"admonition-content"}),Object(c.b)("p",{parentName:"div"},"For more information, please refer to the\n",Object(c.b)("a",Object(i.a)({parentName:"p"},{href:"/docs/reference/sql/sample-by/"}),"SAMPLE BY reference"),"."))),Object(c.b)("h3",{id:"timestamp"},"TIMESTAMP"),Object(c.b)("p",null,"Dynamically creates a\n",Object(c.b)("a",Object(i.a)({parentName:"p"},{href:"/docs/concept/designated-timestamp/"}),"designated timestamp")," on the output of a\nquery. This allows to perform timestamp operations like ",Object(c.b)("a",Object(i.a)({parentName:"p"},{href:"#sample-by"}),"SAMPLE BY"),"\nor ",Object(c.b)("a",Object(i.a)({parentName:"p"},{href:"#latest-by"}),"LATEST BY")," on tables which originally do not have a designated\ntimestamp."),Object(c.b)("div",{className:"admonition admonition-caution alert alert--warning"},Object(c.b)("div",Object(i.a)({parentName:"div"},{className:"admonition-heading"}),Object(c.b)("h5",{parentName:"div"},Object(c.b)("span",Object(i.a)({parentName:"h5"},{className:"admonition-icon"}),Object(c.b)("svg",Object(i.a)({parentName:"span"},{xmlns:"http://www.w3.org/2000/svg",width:"16",height:"16",viewBox:"0 0 16 16"}),Object(c.b)("path",Object(i.a)({parentName:"svg"},{fillRule:"evenodd",d:"M8.893 1.5c-.183-.31-.52-.5-.887-.5s-.703.19-.886.5L.138 13.499a.98.98 0 0 0 0 1.001c.193.31.53.501.886.501h13.964c.367 0 .704-.19.877-.5a1.03 1.03 0 0 0 .01-1.002L8.893 1.5zm.133 11.497H6.987v-2.003h2.039v2.003zm0-3.004H6.987V5.987h2.039v4.006z"})))),"caution")),Object(c.b)("div",Object(i.a)({parentName:"div"},{className:"admonition-content"}),Object(c.b)("p",{parentName:"div"},"The output query must be ordered by time. ",Object(c.b)("inlineCode",{parentName:"p"},"TIMESTAMP()")," does not check for order\nand using timestamp functions on unordered data may produce unexpected results."))),Object(c.b)("h4",{id:"syntax-12"},"Syntax"),Object(c.b)("p",null,Object(c.b)("img",{alt:"Flow chart showing the syntax of the timestamp function",src:a(270).default})),Object(c.b)("div",{className:"admonition admonition-info alert alert--info"},Object(c.b)("div",Object(i.a)({parentName:"div"},{className:"admonition-heading"}),Object(c.b)("h5",{parentName:"div"},Object(c.b)("span",Object(i.a)({parentName:"h5"},{className:"admonition-icon"}),Object(c.b)("svg",Object(i.a)({parentName:"span"},{xmlns:"http://www.w3.org/2000/svg",width:"14",height:"16",viewBox:"0 0 14 16"}),Object(c.b)("path",Object(i.a)({parentName:"svg"},{fillRule:"evenodd",d:"M7 2.3c3.14 0 5.7 2.56 5.7 5.7s-2.56 5.7-5.7 5.7A5.71 5.71 0 0 1 1.3 8c0-3.14 2.56-5.7 5.7-5.7zM7 1C3.14 1 0 4.14 0 8s3.14 7 7 7 7-3.14 7-7-3.14-7-7-7zm1 3H6v5h2V4zm0 6H6v2h2v-2z"})))),"info")),Object(c.b)("div",Object(i.a)({parentName:"div"},{className:"admonition-content"}),Object(c.b)("p",{parentName:"div"},"For more information, refer to the\n",Object(c.b)("a",Object(i.a)({parentName:"p"},{href:"/docs/reference/function/timestamp/"}),"TIMESTAMP reference")))))}I.isMDXComponent=!0},328:function(e,t,a){"use strict";a.r(t),t.default="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MzQiIGhlaWdodD0iMTg0Ij4KICAgIDxkZWZzPgogICAgICAgIDxzdHlsZSB0eXBlPSJ0ZXh0L2NzcyI+CiAgICAgICAgICAgIEBuYW1lc3BhY2UgImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIjsKICAgICAgICAgICAgICAgIC5saW5lICAgICAgICAgICAgICAgICB7ZmlsbDogbm9uZTsgc3Ryb2tlOiAjNjM2MjczO30KICAgICAgICAgICAgICAgIC5ib2xkLWxpbmUgICAgICAgICAgICB7c3Ryb2tlOiAjNjM2MjczOyBzaGFwZS1yZW5kZXJpbmc6IGNyaXNwRWRnZXM7IHN0cm9rZS13aWR0aDogMjsgfQogICAgICAgICAgICAgICAgLnRoaW4tbGluZSAgICAgICAgICAgIHtzdHJva2U6ICM2MzYyNzM7IHNoYXBlLXJlbmRlcmluZzogY3Jpc3BFZGdlc30KICAgICAgICAgICAgICAgIC5maWxsZWQgICAgICAgICAgICAgICB7ZmlsbDogIzYzNjI3Mzsgc3Ryb2tlOiBub25lO30KICAgICAgICAgICAgICAgIHRleHQudGVybWluYWwgICAgICAgICB7Zm9udC1mYW1pbHk6IC1hcHBsZS1zeXN0ZW0sIEJsaW5rTWFjU3lzdGVtRm9udCwgIlNlZ29lIFVJIiwgUm9ib3RvLCBVYnVudHUsIENhbnRhcmVsbCwgSGVsdmV0aWNhLCBzYW5zLXNlcmlmOwogICAgICAgICAgICAgICAgZm9udC1zaXplOiAxMnB4OwogICAgICAgICAgICAgICAgZmlsbDogI2ZmZmZmZjsKICAgICAgICAgICAgICAgIGZvbnQtd2VpZ2h0OiBib2xkOwogICAgICAgICAgICAgICAgfQogICAgICAgICAgICAgICAgdGV4dC5ub250ZXJtaW5hbCAgICAgIHtmb250LWZhbWlseTogLWFwcGxlLXN5c3RlbSwgQmxpbmtNYWNTeXN0ZW1Gb250LCAiU2Vnb2UgVUkiLCBSb2JvdG8sIFVidW50dSwgQ2FudGFyZWxsLCBIZWx2ZXRpY2EsIHNhbnMtc2VyaWY7CiAgICAgICAgICAgICAgICBmb250LXNpemU6IDEycHg7CiAgICAgICAgICAgICAgICBmaWxsOiAjZTI4OWE0OwogICAgICAgICAgICAgICAgZm9udC13ZWlnaHQ6IG5vcm1hbDsKICAgICAgICAgICAgICAgIH0KICAgICAgICAgICAgICAgIHRleHQucmVnZXhwICAgICAgICAgICB7Zm9udC1mYW1pbHk6IC1hcHBsZS1zeXN0ZW0sIEJsaW5rTWFjU3lzdGVtRm9udCwgIlNlZ29lIFVJIiwgUm9ib3RvLCBVYnVudHUsIENhbnRhcmVsbCwgSGVsdmV0aWNhLCBzYW5zLXNlcmlmOwogICAgICAgICAgICAgICAgZm9udC1zaXplOiAxMnB4OwogICAgICAgICAgICAgICAgZmlsbDogIzAwMTQxRjsKICAgICAgICAgICAgICAgIGZvbnQtd2VpZ2h0OiBub3JtYWw7CiAgICAgICAgICAgICAgICB9CiAgICAgICAgICAgICAgICByZWN0LCBjaXJjbGUsIHBvbHlnb24ge2ZpbGw6IG5vbmU7IHN0cm9rZTogbm9uZTt9CiAgICAgICAgICAgICAgICByZWN0LnRlcm1pbmFsICAgICAgICAge2ZpbGw6IG5vbmU7IHN0cm9rZTogI2JlMmY1Yjt9CiAgICAgICAgICAgICAgICByZWN0Lm5vbnRlcm1pbmFsICAgICAge2ZpbGw6IHJnYmEoMjU1LDI1NSwyNTUsMC4xKTsgc3Ryb2tlOiBub25lO30KICAgICAgICAgICAgICAgIHJlY3QudGV4dCAgICAgICAgICAgICB7ZmlsbDogbm9uZTsgc3Ryb2tlOiBub25lO30KICAgICAgICAgICAgICAgIHBvbHlnb24ucmVnZXhwICAgICAgICB7ZmlsbDogI0M3RUNGRjsgc3Ryb2tlOiAjMDM4Y2JjO30KICAgICAgICA8L3N0eWxlPgogICAgPC9kZWZzPgogICAgPHBvbHlnb24gcG9pbnRzPSI5IDYxIDEgNTcgMSA2NSIvPgogICAgPHBvbHlnb24gcG9pbnRzPSIxNyA2MSA5IDU3IDkgNjUiLz4KICAgIDxhIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4bGluazpocmVmPSIjc2VsZWN0IiB4bGluazp0aXRsZT0ic2VsZWN0Ij4KICAgICAgICA8cmVjdCB4PSI1MSIgeT0iNDciIHdpZHRoPSI1NiIgaGVpZ2h0PSIzMiIvPgogICAgICAgIDxyZWN0IHg9IjQ5IiB5PSI0NSIgd2lkdGg9IjU2IiBoZWlnaHQ9IjMyIiBjbGFzcz0ibm9udGVybWluYWwiLz4KICAgICAgICA8dGV4dCBjbGFzcz0ibm9udGVybWluYWwiIHg9IjU5IiB5PSI2NSI+c2VsZWN0PC90ZXh0PgogICAgPC9hPgogICAgPGEgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHhsaW5rOmhyZWY9IiNjb2x1bW4iIHhsaW5rOnRpdGxlPSJjb2x1bW4iPgogICAgICAgIDxyZWN0IHg9IjE2NyIgeT0iNDciIHdpZHRoPSI2NCIgaGVpZ2h0PSIzMiIvPgogICAgICAgIDxyZWN0IHg9IjE2NSIgeT0iNDUiIHdpZHRoPSI2NCIgaGVpZ2h0PSIzMiIgY2xhc3M9Im5vbnRlcm1pbmFsIi8+CiAgICAgICAgPHRleHQgY2xhc3M9Im5vbnRlcm1pbmFsIiB4PSIxNzUiIHk9IjY1Ij5jb2x1bW48L3RleHQ+CiAgICA8L2E+CiAgICA8YSB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgeGxpbms6aHJlZj0iI2V4cHJlc3Npb24iIHhsaW5rOnRpdGxlPSJleHByZXNzaW9uIj4KICAgICAgICA8cmVjdCB4PSIxNjciIHk9IjkxIiB3aWR0aD0iODgiIGhlaWdodD0iMzIiLz4KICAgICAgICA8cmVjdCB4PSIxNjUiIHk9Ijg5IiB3aWR0aD0iODgiIGhlaWdodD0iMzIiIGNsYXNzPSJub250ZXJtaW5hbCIvPgogICAgICAgIDx0ZXh0IGNsYXNzPSJub250ZXJtaW5hbCIgeD0iMTc1IiB5PSIxMDkiPmV4cHJlc3Npb248L3RleHQ+CiAgICA8L2E+CiAgICA8YSB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgeGxpbms6aHJlZj0iI2Z1bmN0aW9uIiB4bGluazp0aXRsZT0iZnVuY3Rpb24iPgogICAgICAgIDxyZWN0IHg9IjE2NyIgeT0iMTM1IiB3aWR0aD0iNzAiIGhlaWdodD0iMzIiLz4KICAgICAgICA8cmVjdCB4PSIxNjUiIHk9IjEzMyIgd2lkdGg9IjcwIiBoZWlnaHQ9IjMyIiBjbGFzcz0ibm9udGVybWluYWwiLz4KICAgICAgICA8dGV4dCBjbGFzcz0ibm9udGVybWluYWwiIHg9IjE3NSIgeT0iMTUzIj5mdW5jdGlvbjwvdGV4dD4KICAgIDwvYT4KICAgIDxhIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4bGluazpocmVmPSIjYWxpYXMiIHhsaW5rOnRpdGxlPSJhbGlhcyI+CiAgICAgICAgPHJlY3QgeD0iMzE1IiB5PSI3OSIgd2lkdGg9IjQ4IiBoZWlnaHQ9IjMyIi8+CiAgICAgICAgPHJlY3QgeD0iMzEzIiB5PSI3NyIgd2lkdGg9IjQ4IiBoZWlnaHQ9IjMyIiBjbGFzcz0ibm9udGVybWluYWwiLz4KICAgICAgICA8dGV4dCBjbGFzcz0ibm9udGVybWluYWwiIHg9IjMyMyIgeT0iOTciPmFsaWFzPC90ZXh0PgogICAgPC9hPgogICAgPHJlY3QgeD0iMTQ3IiB5PSIzIiB3aWR0aD0iMjQiIGhlaWdodD0iMzIiIHJ4PSIxMCIvPgogICAgPHJlY3QgeD0iMTQ1IiB5PSIxIiB3aWR0aD0iMjQiIGhlaWdodD0iMzIiIGNsYXNzPSJ0ZXJtaW5hbCIgcng9IjEwIi8+CiAgICA8dGV4dCBjbGFzcz0idGVybWluYWwiIHg9IjE1NSIgeT0iMjEiPiw8L3RleHQ+CiAgICA8YSB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgeGxpbms6aHJlZj0iI2Zyb20iIHhsaW5rOnRpdGxlPSJmcm9tIj4KICAgICAgICA8cmVjdCB4PSI0MjMiIHk9IjQ3IiB3aWR0aD0iNDgiIGhlaWdodD0iMzIiLz4KICAgICAgICA8cmVjdCB4PSI0MjEiIHk9IjQ1IiB3aWR0aD0iNDgiIGhlaWdodD0iMzIiIGNsYXNzPSJub250ZXJtaW5hbCIvPgogICAgICAgIDx0ZXh0IGNsYXNzPSJub250ZXJtaW5hbCIgeD0iNDMxIiB5PSI2NSI+ZnJvbTwvdGV4dD4KICAgIDwvYT4KICAgIDxhIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4bGluazpocmVmPSIjdGFibGUiIHhsaW5rOnRpdGxlPSJ0YWJsZSI+CiAgICAgICAgPHJlY3QgeD0iNTMxIiB5PSI0NyIgd2lkdGg9IjUyIiBoZWlnaHQ9IjMyIi8+CiAgICAgICAgPHJlY3QgeD0iNTI5IiB5PSI0NSIgd2lkdGg9IjUyIiBoZWlnaHQ9IjMyIiBjbGFzcz0ibm9udGVybWluYWwiLz4KICAgICAgICA8dGV4dCBjbGFzcz0ibm9udGVybWluYWwiIHg9IjUzOSIgeT0iNjUiPnRhYmxlPC90ZXh0PgogICAgPC9hPgogICAgPHJlY3QgeD0iNTMxIiB5PSI5MSIgd2lkdGg9IjI2IiBoZWlnaHQ9IjMyIiByeD0iMTAiLz4KICAgIDxyZWN0IHg9IjUyOSIgeT0iODkiIHdpZHRoPSIyNiIgaGVpZ2h0PSIzMiIgY2xhc3M9InRlcm1pbmFsIiByeD0iMTAiLz4KICAgIDx0ZXh0IGNsYXNzPSJ0ZXJtaW5hbCIgeD0iNTM5IiB5PSIxMDkiPig8L3RleHQ+CiAgICA8YSB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgeGxpbms6aHJlZj0iI3F1ZXJ5IiB4bGluazp0aXRsZT0icXVlcnkiPgogICAgICAgIDxyZWN0IHg9IjU3NyIgeT0iOTEiIHdpZHRoPSI1NiIgaGVpZ2h0PSIzMiIvPgogICAgICAgIDxyZWN0IHg9IjU3NSIgeT0iODkiIHdpZHRoPSI1NiIgaGVpZ2h0PSIzMiIgY2xhc3M9Im5vbnRlcm1pbmFsIi8+CiAgICAgICAgPHRleHQgY2xhc3M9Im5vbnRlcm1pbmFsIiB4PSI1ODUiIHk9IjEwOSI+cXVlcnk8L3RleHQ+CiAgICA8L2E+CiAgICA8cmVjdCB4PSI2NTMiIHk9IjkxIiB3aWR0aD0iMjYiIGhlaWdodD0iMzIiIHJ4PSIxMCIvPgogICAgPHJlY3QgeD0iNjUxIiB5PSI4OSIgd2lkdGg9IjI2IiBoZWlnaHQ9IjMyIiBjbGFzcz0idGVybWluYWwiIHJ4PSIxMCIvPgogICAgPHRleHQgY2xhc3M9InRlcm1pbmFsIiB4PSI2NjEiIHk9IjEwOSI+KTwvdGV4dD4KICAgIDxhIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4bGluazpocmVmPSIjYWxpYXMiIHhsaW5rOnRpdGxlPSJhbGlhcyI+CiAgICAgICAgPHJlY3QgeD0iNzM5IiB5PSI3OSIgd2lkdGg9IjQ4IiBoZWlnaHQ9IjMyIi8+CiAgICAgICAgPHJlY3QgeD0iNzM3IiB5PSI3NyIgd2lkdGg9IjQ4IiBoZWlnaHQ9IjMyIiBjbGFzcz0ibm9udGVybWluYWwiLz4KICAgICAgICA8dGV4dCBjbGFzcz0ibm9udGVybWluYWwiIHg9Ijc0NyIgeT0iOTciPmFsaWFzPC90ZXh0PgogICAgPC9hPgogICAgPHN2ZzpwYXRoIHhtbG5zOnN2Zz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGNsYXNzPSJsaW5lIiBkPSJtMTcgNjEgaDIgbTIwIDAgaDEwIG01NiAwIGgxMCBtNDAgMCBoMTAgbTY0IDAgaDEwIG0wIDAgaDI0IG0tMTI4IDAgaDIwIG0xMDggMCBoMjAgbS0xNDggMCBxMTAgMCAxMCAxMCBtMTI4IDAgcTAgLTEwIDEwIC0xMCBtLTEzOCAxMCB2MjQgbTEyOCAwIHYtMjQgbS0xMjggMjQgcTAgMTAgMTAgMTAgbTEwOCAwIHExMCAwIDEwIC0xMCBtLTExOCAxMCBoMTAgbTg4IDAgaDEwIG0tMTE4IC0xMCB2MjAgbTEyOCAwIHYtMjAgbS0xMjggMjAgdjI0IG0xMjggMCB2LTI0IG0tMTI4IDI0IHEwIDEwIDEwIDEwIG0xMDggMCBxMTAgMCAxMCAtMTAgbS0xMTggMTAgaDEwIG03MCAwIGgxMCBtMCAwIGgxOCBtNDAgLTg4IGgxMCBtMCAwIGg1OCBtLTg4IDAgaDIwIG02OCAwIGgyMCBtLTEwOCAwIHExMCAwIDEwIDEwIG04OCAwIHEwIC0xMCAxMCAtMTAgbS05OCAxMCB2MTIgbTg4IDAgdi0xMiBtLTg4IDEyIHEwIDEwIDEwIDEwIG02OCAwIHExMCAwIDEwIC0xMCBtLTc4IDEwIGgxMCBtNDggMCBoMTAgbS0yNTYgLTMyIGwyMCAwIG0tMSAwIHEtOSAwIC05IC0xMCBsMCAtMjQgcTAgLTEwIDEwIC0xMCBtMjU2IDQ0IGwyMCAwIG0tMjAgMCBxMTAgMCAxMCAtMTAgbDAgLTI0IHEwIC0xMCAtMTAgLTEwIG0tMjU2IDAgaDEwIG0yNCAwIGgxMCBtMCAwIGgyMTIgbTIwIDQ0IGgxMCBtNDggMCBoMTAgbS00NjAgMCBoMjAgbTQ0MCAwIGgyMCBtLTQ4MCAwIHExMCAwIDEwIDEwIG00NjAgMCBxMCAtMTAgMTAgLTEwIG0tNDcwIDEwIHYxMDIgbTQ2MCAwIHYtMTAyIG0tNDYwIDEwMiBxMCAxMCAxMCAxMCBtNDQwIDAgcTEwIDAgMTAgLTEwIG0tNDUwIDEwIGgxMCBtMCAwIGg0MzAgbTQwIC0xMjIgaDEwIG01MiAwIGgxMCBtMCAwIGg5NiBtLTE4OCAwIGgyMCBtMTY4IDAgaDIwIG0tMjA4IDAgcTEwIDAgMTAgMTAgbTE4OCAwIHEwIC0xMCAxMCAtMTAgbS0xOTggMTAgdjI0IG0xODggMCB2LTI0IG0tMTg4IDI0IHEwIDEwIDEwIDEwIG0xNjggMCBxMTAgMCAxMCAtMTAgbS0xNzggMTAgaDEwIG0yNiAwIGgxMCBtMCAwIGgxMCBtNTYgMCBoMTAgbTAgMCBoMTAgbTI2IDAgaDEwIG00MCAtNDQgaDEwIG0wIDAgaDU4IG0tODggMCBoMjAgbTY4IDAgaDIwIG0tMTA4IDAgcTEwIDAgMTAgMTAgbTg4IDAgcTAgLTEwIDEwIC0xMCBtLTk4IDEwIHYxMiBtODggMCB2LTEyIG0tODggMTIgcTAgMTAgMTAgMTAgbTY4IDAgcTEwIDAgMTAgLTEwIG0tNzggMTAgaDEwIG00OCAwIGgxMCBtMjMgLTMyIGgtMyIvPgogICAgPHBvbHlnb24gcG9pbnRzPSI4MjUgNjEgODMzIDU3IDgzMyA2NSIvPgogICAgPHBvbHlnb24gcG9pbnRzPSI4MjUgNjEgODE3IDU3IDgxNyA2NSIvPgo8L3N2Zz4K"}}]);