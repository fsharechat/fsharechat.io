(window.webpackJsonp=window.webpackJsonp||[]).push([[2],{60:function(e,n,t){"use strict";t.r(n),t.d(n,"frontMatter",(function(){return i})),t.d(n,"metadata",(function(){return r})),t.d(n,"rightToc",(function(){return s})),t.d(n,"default",(function(){return b}));var a=t(2),o=t(6),l=(t(0),t(218)),i={title:"Indexes",sidebar_label:"Indexes",description:"Explanation on how indexes work as well as the pros and cons that you need to be aware of when using them."},r={unversionedId:"concept/indexes",id:"concept/indexes",isDocsHomePage:!1,title:"Indexes",description:"Explanation on how indexes work as well as the pros and cons that you need to be aware of when using them.",source:"@site/docs/concept/indexes.md",slug:"/concept/indexes",permalink:"/docs/concept/indexes",version:"current",sidebar_label:"Indexes",sidebar:"docs",previous:{title:"Symbol",permalink:"/docs/concept/symbol"},next:{title:"How to use QuestDB with Docker",permalink:"/docs/guide/docker"}},s=[{value:"How indexes work",id:"how-indexes-work",children:[{value:"Advantages",id:"advantages",children:[]},{value:"Trade-offs",id:"trade-offs",children:[]}]}],c={rightToc:s};function b(e){var n=e.components,t=Object(o.a)(e,["components"]);return Object(l.b)("wrapper",Object(a.a)({},c,t,{components:n,mdxType:"MDXLayout"}),Object(l.b)("p",null,"An index stores the row locations for each value of the target column in order\nto provide faster read access. It allows you to bypass full table scans by\ndirectly accessing the relevant rows during queries with ",Object(l.b)("inlineCode",{parentName:"p"},"WHERE")," conditions."),Object(l.b)("p",null,"Indexing is available for ",Object(l.b)("a",Object(a.a)({parentName:"p"},{href:"/docs/concept/symbol/"}),"symbol")," columns. Index support\nfor other types will be added over time."),Object(l.b)("p",null,"There are two ways to create an index:"),Object(l.b)("ul",null,Object(l.b)("li",{parentName:"ul"},"At table creation time using\n",Object(l.b)("a",Object(a.a)({parentName:"li"},{href:"/docs/reference/sql/create-table/#index"}),"CREATE TABLE")),Object(l.b)("li",{parentName:"ul"},"Using ",Object(l.b)("a",Object(a.a)({parentName:"li"},{href:"/docs/reference/sql/alter-table-alter-column-add-index/"}),"ALTER TABLE"))),Object(l.b)("h2",{id:"how-indexes-work"},"How indexes work"),Object(l.b)("p",null,"Index creates a table of row locations for each distinct value for the target\n",Object(l.b)("a",Object(a.a)({parentName:"p"},{href:"/docs/concept/symbol/"}),"symbol"),". Once the index is created, inserting data into\nthe table will update the index. Lookups on indexed values will be performed in\nthe index table directly which will provide the memory locations of the items,\nthus avoiding unnecessary table scans."),Object(l.b)("p",null,"Here is an example of a table and its index table."),Object(l.b)("pre",null,Object(l.b)("code",Object(a.a)({parentName:"pre"},{className:"language-shell"}),"Table                                       Index\n|Row ID | Symbol    | Value |             | Symbol     | Row IDs       |\n| 1     | A         | 1     |             | A          | 1, 2, 4       |\n| 2     | A         | 0     |             | B          | 3             |\n| 3     | B         | 1     |             | C          | 5             |\n| 4     | A         | 1     |\n| 5     | C         | 0     |\n")),Object(l.b)("p",null,Object(l.b)("inlineCode",{parentName:"p"},"INSERT INTO Table values(B, 1);")," would trigger two updates: one for the Table,\nand one for the Index."),Object(l.b)("pre",null,Object(l.b)("code",Object(a.a)({parentName:"pre"},{className:"language-shell"}),"Table                                       Index\n|Row ID | Symbol    | Value |             | Symbol     | Row IDs       |\n| 1     | A         | 1     |             | A          | 1, 2, 4       |\n| 2     | A         | 0     |             | B          | 3, 6          |\n| 3     | B         | 1     |             | C          | 5             |\n| 4     | A         | 1     |\n| 5     | C         | 0     |\n| 6     | B         | 1     |\n")),Object(l.b)("h3",{id:"advantages"},"Advantages"),Object(l.b)("p",null,"Index allows you to greatly reduce the complexity of queries that span a subset\nof an indexed column, typically when using WHERE clauses."),Object(l.b)("p",null,"Consider the following query applied to the above table\n",Object(l.b)("inlineCode",{parentName:"p"},"SELECT sum(Value) FROM Table WHERE Symbol='A';")),Object(l.b)("ul",null,Object(l.b)("li",{parentName:"ul"},Object(l.b)("strong",{parentName:"li"},"Without Index"),", the query engine would scan the whole table in order to\nperform the query. It will need to perform 6 operations (read each of the 6\nrows once)."),Object(l.b)("li",{parentName:"ul"},Object(l.b)("strong",{parentName:"li"},"With Index"),", the query engine will first scan the index table, which is\nconsiderably smaller. In our example, it will find A in the first row. Then,\nthe query engine would check the values at the specific locations 1, 2, 4 in\nthe table to read the corresponding values. As a result, it would only scan\nthe relevant rows in the table and leave irrelevant rows untouched.")),Object(l.b)("h3",{id:"trade-offs"},"Trade-offs"),Object(l.b)("ul",null,Object(l.b)("li",{parentName:"ul"},Object(l.b)("p",{parentName:"li"},Object(l.b)("strong",{parentName:"p"},"Storage space"),": The index will maintain a table with each distinct symbol\nvalue and the locations where these symbols can be found. As a result, there\nis a small cost of storage associated with indexing a symbol field.")),Object(l.b)("li",{parentName:"ul"},Object(l.b)("p",{parentName:"li"},Object(l.b)("strong",{parentName:"p"},"Ingestion performance"),": Each new entry in the table will trigger an entry\nin the Index table. This means that any write will now require two write\noperations, and therefore take twice as long."))))}b.isMDXComponent=!0}}]);