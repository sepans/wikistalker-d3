![wikistalker-borges2](https://user-images.githubusercontent.com/687513/202743886-e1602ba2-3685-4ace-a9f5-18753508a6fb.jpeg)


Wikistalker illustrates the relations between different things by visualizing the semantic relevance between the inter-connected structure of their Wikipedia entry articles.
In this visualization, each bar (or ray) represents an outgoing link from the Wikipedia article with its length corresponding to the semantic relevance of two connected articles.
You can filter links by their relatedness using the sliding bar and sort them alphabetically or by relevance.

Hyperlinks, once being an addition to the textual content, now in many cases are as significant as the content itself. In Wikistalker this idea is pushed to its limits by removing the content and only showing the structure of hyperlinks. It also revisits the idea behind Web Stalker, visualizing the structure and connections between different elements of cyberspace, instead of showing the content. It creates an alternative reading and navigation experience of Wikipedia articles by leaving the pathways and spatial arrangements the same, but creating a new navigational perspective of the virtual space of Wikipedia corpus.

Wikistalker is also a tool for the cartography of things from the collective perspective of Wikipedia contributors mined by machine learning algorithms. This gives a picture of the inter-connected entities within the world, mirrored in the structure of Wikipedia.
This project is implemented in HTML5 using d3.js and jquery
The semantic relevance measure is calculated by data mining the Wikipedia corpus using Wikipedia Miner algorithm.
