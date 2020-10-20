(window.webpackJsonp=window.webpackJsonp||[]).push([[97],{169:function(e,t,a){"use strict";a.r(t),a.d(t,"frontMatter",(function(){return s})),a.d(t,"metadata",(function(){return r})),a.d(t,"rightToc",(function(){return l})),a.d(t,"default",(function(){return h}));var n=a(2),o=a(6),i=(a(0),a(218)),s={title:"My journey making QuestDB",author:"Vlad Ilyushchenko",author_title:"QuestDB Team",author_url:"https://github.com/bluestreak01",author_image_url:"https://avatars.githubusercontent.com/bluestreak01",description:"The detailed story of how the open source time series database QuestDB came to life.",tags:["hackernews","story"],image:"/img/blog/2020-08-06/foggy-path.jpg"},r={permalink:"/blog/2020/08/06/my-journey-writing-questdb",source:"@site/blog/2020-08-06-my-journey-writing-questdb.md",description:"The detailed story of how the open source time series database QuestDB came to life.",date:"2020-08-06T00:00:00.000Z",tags:[{label:"hackernews",permalink:"/blog/tags/hackernews"},{label:"story",permalink:"/blog/tags/story"}],title:"My journey making QuestDB",readingTime:5.135,truncated:!0,prevItem:{title:"Re-examining our approach to memory mapping",permalink:"/blog/2020/08/19/memory-mapping-deep-dive"},nextItem:{title:"Use QuestDB and get swag!",permalink:"/blog/2020/07/24/use-questdb-for-swag"}},l=[{value:"The setup",id:"the-setup",children:[]},{value:"Taking the plunge",id:"taking-the-plunge",children:[]},{value:"Back to the drawing board",id:"back-to-the-drawing-board",children:[]},{value:"It&#39;s getting real!",id:"its-getting-real",children:[]}],d={rightToc:l};function h(e){var t=e.components,a=Object(o.a)(e,["components"]);return Object(i.b)("wrapper",Object(n.a)({},d,a,{components:t,mdxType:"MDXLayout"}),Object(i.b)("p",null,"A few weeks ago, I posted\n",Object(i.b)("a",Object(n.a)({parentName:"p"},{href:"https://news.ycombinator.com/item?id=23975807"}),"the story of how I started QuestDB on Hacker News"),".\nAs it seems several people found the story interesting, I thought I would post\nit here."),Object(i.b)("img",{className:"banner",alt:"A path going into the morning mist",src:"/img/blog/2020-08-06/foggyPath.jpg"}),Object(i.b)("h2",{id:"the-setup"},"The setup"),Object(i.b)("p",null,"It started in 2012 when an energy trading company hired me to rebuild their\nreal-time vessel tracking system. Management wanted me to use a well-known XML\ndatabase that they had just bought a license for. This option would have\nrequired to take down production for about a week just to ingest the data. And a\nweek downtime was not an option. With no more money to spend on software, I\nturned to alternatives such as OpenTSDB but they were not a fit for our data\nmodel. There was no solution in sight to deliver the project."),Object(i.b)("p",null,"Then, I stumbled upon\n",Object(i.b)("a",Object(n.a)({parentName:"p"},{href:"https://github.com/peter-lawrey/Java-Chronicle"}),"Peter Lawrey\u2019s Java Chronicle library"),".\nIt loaded the same data in 2 minutes instead of a week using memory-mapped\nfiles. Besides the performance aspect, I found it fascinating that such a simple\nmethod was solving multiple issues simultaneously: fast write, read can happen\neven before data is committed to disk, code interacts with memory rather than IO\nfunctions, no buffers to copy. Incidentally, this was my first exposure to\nzero-GC Java."),Object(i.b)("p",null,"But there were several issues. First, at the time It didn\u2019t look like the\nlibrary was going to be maintained. Second, it used Java NIO instead of using\nthe OS API directly. This adds overhead since it creates individual objects with\nsole purpose to hold a memory address for each memory page. Third, although the\nNIO allocation API was well documented, the release API was not. It was really\neasy to run out of memory and hard to manage memory page release. I decided to\nditch the XML DB and then started to write a custom storage engine in Java,\nsimilar to what Java Chronicle did. This engine used memory mapped files,\noff-heap memory and a custom query system for geospatial time series.\nImplementing this was a refreshing experience. I learned more in a few weeks\nthan in years on the job."),Object(i.b)("p",null,"Throughout my career, I mostly worked at large companies where developers are\n\u201cmanaged\u201d via itemized tasks sent as tickets. There was no room for creativity\nor initiative. In fact, it was in one\u2019s best interest to follow the ticket's\nexact instructions, even if it was complete nonsense. I had just been promoted\nto a managerial role and regretted it after a week. After so much time hoping\nfor a promotion, I immediately wanted to go back to the technical side. I became\nobsessed with learning new stuff again, particularly in the high performance\nspace."),Object(i.b)("h2",{id:"taking-the-plunge"},"Taking the plunge"),Object(i.b)("p",null,"With some money aside, I left my job and started to work on QuestDB solo. I used\nJava and a small C layer to interact directly with the OS API without passing\nthrough a selector API. Although existing OS API wrappers would have been easier\nto get started with, the overhead increases complexity and hurts performance. I\nalso wanted the system to be completely GC-free. To do this, I had to build\noff-heap memory management myself and I could not use off-the-shelf libraries. I\nhad to rewrite many of the standard ones over the years to avoid producing any\ngarbage."),Object(i.b)("p",null,"As I had my first kid, I had to take contracting gigs to make ends meet over the\nfollowing 6 years. All the stuff I had been learning boosted my confidence and I\nstarted performing well at interviews. This allowed me to get better paying\ncontracts, I could take fewer jobs and free up more time to work on QuestDB\nwhile looking after my family. I would do research during the day and implement\nthis into QuestDB at night. I was constantly looking for the next thing, which\nwould take performance closer to the limits of the hardware."),Object(i.b)("h2",{id:"back-to-the-drawing-board"},"Back to the drawing board"),Object(i.b)("p",null,"A year in, I realised that my initial design was actually flawed and that it had\nto be thrown away. It had no concept of separation between readers and writers\nand would thus allow dirty reads. Storage was not guaranteed to be contiguous,\nand pages could be of various non-64-bit-divisible sizes. It was also very much\ncache-unfriendly, forcing the use of slow row-based reads instead of fast\ncolumnar and vectorized ones. Commits were slow, and as individual column files\ncould be committed independently, they left the data open to corruption."),Object(i.b)("p",null,"Although this was a setback, I got back to work. I wrote the new engine to allow\natomic and durable multi-column commits, provide repeatable read isolation, and\nfor commits to be instantaneous. To do this, I separated transaction files from\nthe data files. This made it possible to commit multiple columns simultaneously\nas a simple update of the last committed row id. I also made storage dense by\nremoving overlapping memory pages and writing data byte by byte over page edges."),Object(i.b)("h2",{id:"its-getting-real"},"It's getting real!"),Object(i.b)("p",null,"This new approach improved query performance. It made it easy to split data\nacross worker threads and to optimise the CPU pipeline with prefetch. It\nunlocked column-based execution and additional virtual parallelism with\n",Object(i.b)("a",Object(n.a)({parentName:"p"},{href:"https://news.ycombinator.com/item?id=22803504"}),"SIMD instruction sets")," thanks to\n",Object(i.b)("a",Object(n.a)({parentName:"p"},{href:"https://www.agner.org/optimize/vectorclass.pdf"}),"Agner Fog\u2019s Vector Class Library"),".\nIt made it possible to implement more recent innovations like our\n",Object(i.b)("a",Object(n.a)({parentName:"p"},{href:"https://github.com/questdb/questdb/blob/master/core/src/main/c/share/rosti.h"}),"own version of Google SwissTable"),".\nI published more details when we released a demo server a few weeks ago on\n",Object(i.b)("a",Object(n.a)({parentName:"p"},{href:"https://news.ycombinator.com/item?id=23616878"}),"ShowHN"),". This\n",Object(i.b)("a",Object(n.a)({parentName:"p"},{href:"http://try.questdb.io:9000/"}),"demo")," is still available to try online with a\npre-loaded dataset of 1.6 billion rows. Although it was hard and discouraging at\nfirst, this rewrite turned out to be the second best thing that happened to\nQuestDB."),Object(i.b)("p",null,"The best thing was that people started to contribute to the project. I am really\nhumbled that Tanc and Nic left our previous employer to build QuestDB. A few\nmonths later, former colleagues of mine left their stable low-latency jobs at\nbanks to join us. I take this as a huge responsibility and I don\u2019t want to let\nthese guys down. The amount of work ahead gives me headaches and goosebumps at\nthe same time."))}h.isMDXComponent=!0}}]);