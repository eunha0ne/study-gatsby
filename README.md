# GraphQL and Gatsby

> Gatsby의 GraphQL 문서를 정리한 내용을 담고 있습니다.

* [Why Gatsby uses GraphQL](#1-why-gatsby-uses-graphql)
  * [Create a page without any data](#1-1-create-a-page-without-any-data)
  * [Create a page with hard-coded data](#1-2-create-a-page-with-hard-coded-data)
  * [Create pages from JSON with images](#1-3-create-pages-from-json-with-images)
  * [Create pages using GraphQL](#1-4-create-pages-using-graphql)
  * [Generate pages with GraphQL](#1-5-generate-pages-with-graphql)
* [Understanding GraphQL Syntax](#2-understanding-graphql-syntax)
  * [Basic query](#2-1-Basic-query)
  * [A longer query](#2-2-A-longer-query)
  * [Limit](#2-3-Limit)
  * [Skip](#2-4-Skip)
  * [Filter](#2-5-Filter)
  * [Comple list of possible operators](#2-6-Comple-list-of-possible-operators)
  * [Sort](#2-7-Sort)
  * [Format](#2-8-Format)
    * Date
    * Excerpt
  * [Sort, filter, limit & format together](#2-9-Sort-filter-limit-&-format-together)
  * [Query variables](#2-10-Query-variables)
  * [Group](#Group)
  * [Fragments](#Fragments)
  * [Aliasing](#Aliasing)

When building with Gatsby, you access your data through a query language named GraphQL. **`GraphQL` allows you to declaratively express your data needs.** This is done with queries, **`queries` are the representation of the data you need.** A query looks like this:

```javascript
{
  site {
    siteMetadata {
      title
    }
  }
}
```

```json
{
  "site": {
    "siteMetadata": {
      "title": "A Gatsby site!"
    }
  }
}
```

Notice how the query signature exactly matches the returned JSON signature. This is possible because in GraphQL, **you query against a `schema` that is the representation of your available data.** Don’t worry about where the schema comes from right now, Gatsby takes care of organizing all of your data for you and making it discoverable with a tool called `GraphiQL`.

1. run queries against your data in the browser
2. dig into the structure of data available to you through a data type explorer.

## 1. Why Gatsby uses GraphQL

### 1-1 Create a page without any data

A common question about Gatsby is, “Why does Gatsby use GraphQL? Doesn’t it generate static files?”

For any kind of pages that aren’t directly created in `src/pages/`, you’ll need Gatsby’s `createPages` `Node API` to create pages programmatically.

All that’s required to create a page is a `path` where it should be created and the component that should be rendered there.

```javascript
// src/templates/no-data.js
import React from "react";

const NoData = () => (
  <section>
    <h1>This Page Was Created Programmatically</h1>
    <p>
      No data was required to create this page — it’s just a React component!
    </p>
  </section>
);

export default NoData;
```

You could programmatically create a page at /no-data/ by adding the following to `gatsby-node.js`:

```javascript
//gatsby-node.js
exports.createPages = ({ actions: { createPage } }) => {
  createPage({
    path: "/no-data/",
    component: require.resolve("./src/templates/no-data.js"),
  });
};
```

However, you’ll often want to pass data to the page so that the template component is reusable.

### 1-2. Create a page with hard-coded data

To pass data to the created pages, you’ll need to pass `context` to the `createPage` call. In `gatsby-node.js`, we can add context like so:

```javascript
exports.createPages = ({ actions: { createPage } }) => {
  createPage({
    path: "/page-with-context/",
    component: require.resolve("./src/templates/with-context.js"),
    context: {
      title: "We Don’t Need No Stinkin’ GraphQL!",
      content: "<p>This is page content.</p><p>No GraphQL required!</p>",
    },
  });
};
```

The `context` property accepts an object, and we can pass in any data we want the page to be able to access. When Gatsby creates pages, it includes a prop called `pageContext` and sets its value to `context`, so we can access any of the values in our component:

```javascript
//src/templates/with-context.js
import React from "react";

const WithContext = ({ pageContext }) => (
  <section>
    <h1>{pageContext.title}</h1>
    <div dangerouslySetInnerHTML={{ __html: pageContext.content }} />
  </section>
);

export default WithContext;
```

### 1-3. Create pages from JSON with images

In many cases, the data for pages can’t feasibly be hard-coded into `gatsby-node.js`. More likely it will come from an external source, such as a third-party API, local Markdown, or JSON files.

```json
[
  {
    "title": "Vintage Purple Tee",
    "slug": "vintage-purple-tee",
    "description": "<p>Keep it simple with this vintage purple tee.</p>",
    "price": "$10.00",
    "image": "/images/amberley-romo-riggins.jpg"
  },
  {
    "title": "Space Socks",
    "slug": "space-socks",
    "description": "<p>Get your feet into these spaced-out black socks with a Gatsby purple border and heel.</p>",
    "price": "$10.00",
    "image": "/images/erin-fox-and-sullivan.jpg"
  },
  {
    "title": "This Purple Hat Is Blazing Fast",
    "slug": "purple-hat",
    "description": "<p>Add more blazingly blazing speed to your wardrobe with this solid purple laundered chino twill hat.</p>",
    "price": "$10.00",
    "image": "/images/david-bailey-cat-hat.jpg"
  }
]
```

The images need to be added to the /static/images/ folder. (This is where things start to get hard to manage — the JSON and the images aren’t in the same place.)

Once the JSON and the images are added, you can create product pages by importing the JSON into gatsby-node.js and loop through the entries to create pages:

```javascript
// gatsby-node.js
exports.createPages = ({ actions: { createPage } }) => {
  const products = require("./data/products.json");
  products.forEach(product => {
    createPage({
      path: `/product/${product.slug}/`,
      component: require.resolve("./src/templates/product.js"),
      context: {
        title: product.title,
        description: product.description,
        image: product.image,
        price: product.price,
      },
    });
  });
};
```

The product template still uses pageContext to display the product data:

```jsx
// src/templates/product.js
import React from "react";
const Product = ({ pageContext }) => (
  <div>
    <h1>{pageContext.title}</h1>
    <img
      src={pageContext.image}
      alt={pageContext.title}
      style={{ float: "left", marginRight: "1rem", width: 150 }}
    />
    <p>{pageContext.price}</p>
    <div dangerouslySetInnerHTML={{ __html: pageContext.description }} />
  </div>
);
export default Product;
```

This gets the job done, but it has a few shortcomings that are going to get more complicated as time goes on:

- The images and the product data are in different places in the source code.
- The image paths are absolute from the built site, not the source code, which makes it confusing to know how to find them from the JSON.
- The images are unoptimized, and any optimization you do would have to be manual.
- To create a preview listing of all products, we’d need to pass all of the product info in `context`, which will get unweildy as the number of products increases.
- It’s not very obvious where data is coming from in the templates that render the pages, so updating the data might be confusing later.

**To overcome these limitations, Gatsby introduces GraphQL as a data management layer.**

### 1-4. Create pages using GraphQL

Using data/products.json as an example, by using GraphQL we’re able to solve all of the limitations from the previous section:

- The images can be colocated with the products in data/images/.
- Image paths in data/products.json can be relative to the JSON file.
- Gatsby can automatically optimize images for faster loading and better user experience.
- We no longer need to pass all product data into `context` when creating pages.
- Data is loaded using GraphQL in the components where it’s used, making it much easier to see where data comes from and how to change it.

In order to load the product and image data into GraphQL, we need to add a few Gatsby plugins. Namely, we need plugins to:

- Load the JSON file into Gatsby’s internal data store, which can be queried using GraphQL (gatsby-source-filesystem)
- Convert JSON files into a format we can query with GraphQL (gatsby-transformer-json)
- Optimize images (gatsby-plugin-sharp)
- Add data about optimized images to Gatsby’s data store (gatsby-transformer-sharp)

```shell
npm install --save gatsby-source-filesystem gatsby-transformer-json gatsby-plugin-sharp gatsby-transformer-sharp gatsby-image
```

```js
module.exports = {
  plugins: [
    {
      resolve: "gatsby-source-filesystem",
      options: {
        path: "./data/",
      },
    },
    "gatsby-transformer-json",
    "gatsby-transformer-sharp",
    "gatsby-plugin-sharp",
  ],
};
```

You can explore the available data schema using the “Docs” tab at the right. One of the available options is `allProductsJson`, which contains “edges”, and those contain “nodes”. The JSON transformer plugin has created one node for each product, and inside the node we can select the data we need for that product.
```
{
  allProductsJson {
    edges {
      node {
        slug
      }
    }
  }
}
```
Test this query by entering it into the left-hand panel of the `[GraphQL Playground](https://github.com/prisma/graphql-playground)`, then pressing the play button in the top center.


### 1-5. Generate pages with GraphQL
In gatsby-node.js, we can use the GraphQL query we just wrote to generate pages.
```js
// gatsby-node.js
exports.createPages = async ({ actions: { createPage }, graphql }) => {
  const results = await graphql(`
    {
      allProductsJson {
        edges {
          node {
            slug
          }
        }
      }
    }
  `)
  results.data.allProductsJson.edges.forEach(edge => {
    const product = edge.node
    createPage({
      path: `/gql/${product.slug}/`,
      component: require.resolve("./src/templates/product-graphql.js"),
      context: {
        slug: product.slug,
      },
    })
  })
}
```
You need to use the graphql helper that’s available to the `createPages` Node API to execute the query. To make sure that the result of the query comes back before continuing, use `async`/`await`.

The results that come back are very similar to the contents of data/products.json, so you can loop through the results and create a page for each. However, **note that you’re only passing the slug in context — you’ll use this in the template component to load more product data.**

As you’ve already seen, the context argument is made available to the template component in the pageContext prop. To make queries more powerful, Gatsby also exposes everything in context as a GraphQL variable, which means you can write a query that says, in plain English, “Load data for the product with the slug passed in context.”

```jsx
// src/templates/product-graphql.js
import React from "react"
import { graphql } from "gatsby"
import Image from "gatsby-image"
export const query = graphql`
  query($slug: String!) {
    productsJson(slug: { eq: $slug }) {
      title
      description
      price
      image {
        childImageSharp {
          fluid {
            ...GatsbyImageSharpFluid
          }
        }
      }
    }
  }
`
const Product = ({ data }) => {
  const product = data.productsJson
  return (
    <div>
      <h1>{product.title}</h1>
      <Image
        fluid={product.image.childImageSharp.fluid}
        alt={product.title}
        style={{ float: "left", marginRight: "1rem", width: 150 }}
      />
      <p>{product.price}</p>
      <div dangerouslySetInnerHTML={{ __html: product.description }} />
    </div>
  )
}
export default Product
```
A few notes about this file:
* The result of the query is added to the template component as the data prop.
* The image path was automatically converted by the Sharp transformer into a “child node” that includes optimized versions of the image.
* The query uses a `[GraphQL fragment](https://www.gatsbyjs.org/packages/gatsby-image/)` to query all the required data for optimized images. GraphQL fragments do not work in the GraphQL Playground.
* The img tag has been swapped out for a gatsby-image component named Image. Instead of a src attribute, it accepts an object with optimized image data.

After the initial setup, loading data with GraphQL is fairly similar to directly loading JSON, but **it provides extra benefits like automatically optimizing images and keeping the data loading in the same place where it’s used.**

GraphQL is certainly not required, but the benefits of adopting GraphQL are significant. **GraphQL will simplify the process of building and optimizing your pages**, so it’s considered a best practice for structuring and writing Gatsby applications.


## 2. Understanding GraphQL Syntax

### 2-1. Basic query

Let’s start with the basics, pulling up the site `title` from your `gatsby-config.js`’s `siteMetaData`:
```
{
  site {
    siteMetadata {
      title
    }
  }
}
```
When typing in the query editor you can use `Ctrl + Space` to see autocomplete options and `Ctrl + Enter` to run the current query.

### 2-2. A longer query

**Gatsby structures its content as collections of nodes, which are connected to each other with `edges`**. In this query you ask for the total count of plugins in this Gatsby site, along with specific information about each one.
```
{
  allSitePlugin {
    totalCount
    edges {
      node {
        name
        version
        packageJson {
          description
        }
      }
    }
  }
}
```

### 2-3. Limit

There are several ways to reduce the number of results from a query. Here totalCount tells you there’s 8 results, but `limit` is used to show only the first three.
```
{
  allMarkdownRemark(limit: 3) {
    totalCount
    edges {
      node {
        frontmatter {
          title
        }
      }
    }
  }
}
```

### 2-4. Skip

Skip over a number of results. In this query `skip` is used to omit the first 3 results.
```
{
  allMarkdownRemark(skip: 1) {
    totalCount
    edges {
      node {
        frontmatter {
          title
        }
      }
    }
  }
}
```

### 2-5. Filter 

In this query `filter` and the `ne(not equals)` operator is used to show only results that have a title. [A good video tutorial](https://www.youtube.com/watch?v=Lg1bom99uGM) on this is here.
```
{
  allMarkdownRemark(
    filter: {
      frontmatter: {title: {ne: ""}}
    }
  ) {
    totalCount
    edges {
      node {
        frontmatter {
          title
        }
      }
    }
  }
}
```
Gatsby relies on [Sift](https://www.npmjs.com/package/sift) to enable MongoDB-like query syntax for object filtering. This allows Gatsby to support operators like `eq`, `ne`, `in`, `regex` and querying nested fields through the `__` connector. 

It is also possible to filter on multiple fields - just separate the individual filters by a comma (works as an AND):
```js
filter: { contentType: { in: ["post", "page"] }, draft: { eq: false } }
```

(1) In this query the fields `categories` and `title` are filtered to find the book that has Fantastic in its title and belongs to the magical creatures category. (2) And you can also combine the mentioned operators. This query filters on `/History/` for the `regex` operator. The result is Hogwarts: A History and History of Magic. You can filter out the latter with the `ne` operator.
```
# example: 1
{
  allMarkdownRemark(
    filter: {
      frontmatter: {
        categories: {
          in: ["magical creatures"]
        }
        title: {regex: "/Fantastic/"
        }
      }
    }
  ) {
    totalCount
    edges {
      node {
        frontmatter {
          title
        }
      }
    }
  }
}

# example: 2
{
  allMarkdownRemark(
    filter: {
      frontmatter: {
        title: {
          regex: "/History/"
          ne: "History of Magic"
        }
      }
    }
  ) {
    totalCount
    edges {
      node {
        frontmatter {
          title
        }
      }
    }
  }
}
```

### 2-6. Complete list of possible operators
* eq: short for equal, must match the given data exactly
* ne: short for not equal, must be different from the given data
* regex: short for regular expression, must match the given pattern. **Note that backslashes need to be escaped twice**, so `/\w+/` needs to be written as `"/\\\\w+/"`.
* glob: short for global, allows to use wildcard `*` which acts as a placeholder for any non-empty string
* in: short for in array, must be an element of the array
* nin: short for not in array, must NOT be an element of the array
* gt: short for greater than, must be greater than given value
* gte: short for greater than or equal, must be greater than or equal to given value
* lt: short for less than, must be less than given value
* lte: short for less than or equal, must be less than or equal to given value
* elemMatch: short for element match, this indicates that the field you are filtering will return an array of elements, on which you can apply a filter using the previous operators

### 2-7. Sort
The ordering of your results can be specified with `sort`. Here the results are sorted in ascending order of `frontmatter`’s `date` field.
```
{
  allMarkdownRemark(
    sort: {
      fields: [frontmatter___date]
      order: ASC
    }
  ) {
    totalCount
    edges {
      node {
        frontmatter {
          title
          date
        }
      }
    }
  }
}

```

```
# example: 1
{
  allMarkdownRemark(
    sort: {
      fields: [frontmatter___date, frontmatter___title]
      order: ASC
    }
  ) {
    totalCount
    edges {
      node {
        frontmatter {
          title
          date
        }
      }
    }
  }
}

# example: 2
{
  allMarkdownRemark(
    sort: {
      fields: [frontmatter___date, frontmatter___title]
      order: [ASC, DESC]
    }
  ) {
    totalCount
    edges {
      node {
        frontmatter {
          title
          date
        }
      }
    }
  }
}

```
(1) You can also sort on multiple fields but the `sort` keyword can only be used once. The second sort field gets evaluated when the first field (here: date) is identical. The results of the following query are sorted in ascending order of date and title field.

Children's Anthology of Monsters and Break with Banshee both have the same date (1992-01-02) but in the first query (only one sort field) the latter comes after the first. The additional sorting on the title puts Break with Banshee in the right order.

By default, sort fields will be sorted in ascending order. Optionally, you can specify a sort order per field by providing an array of `ASC (for ascending)` or `DESC (for descending)` values. (2) For example, to sort by frontmatter.date in ascending order, and additionally by frontmatter.title in descending order, you would use sort: { fields: [frontmatter___date, frontmatter___title], order: [ASC, DESC] }. Note that if you only provide a single sort order value, this will affect the first sort field only, the rest will be sorted in default ascending order.

### 2-8. Format
#### Date
Dates can be formatted using the `formatString` function.
```
{
  allMarkdownRemark(
    filter: {frontmatter: {date: {ne: null}}}
  ) {
    edges {
      node {
        frontmatter {
          title
          date(
            formatString: "dddd DD MMMM YYYY" // "Wednesday 01 January 1992"
            locale: "de-DE" // or "ko"
          ) 
        }
      }
    }
  }
}

```
You can also pass in a `locale` to adapt the output to your language. The above query gives you the english output for the weekdays, this example outputs them in german. See [moment.js documentation](https://momentjs.com/docs/#/displaying/format/) for more tokens.

Dates also accept the `fromNow` and `difference` function. The former returns a string generated with Moment.js’ fromNow function, the latter returns the difference between the date and current time (using Moment.js’ difference function).

#### Excerpt

Excerpts accept three options: `pruneLength`, `truncate`, and `format`. `format` can be `PLAIN` or `HTML`.
```
{
  allMarkdownRemark(
    filter: {frontmatter: {date: {ne: null}}}
    limit: 5
  ) {
    edges {
      node {
        frontmatter {
          title
        }
        excerpt(
          format: PLAIN
          pruneLength: 200
          truncate: true
        )
      }
    }
  }
}

```

### 2-9. Sort, filter, limit & format together

This query combines sorting, filtering, limiting and formatting together.
```
{
  allMarkdownRemark(
    limit: 3
    filter: { frontmatter: { date: { ne: null } } }
    sort: { fields: [frontmatter___date], order: DESC }
  ) {
    edges {
      node {
        frontmatter {
          title
          date(formatString: "dddd DD MMMM YYYY")
        }
      }
    }
  }
}
```

### 2-10. Query variables

In addition to adding query arguments directly to queries, **GraphQL allows to pass in “query variables”. These can be both simple scalar values as well as objects.** The query below is the same one as the previous example, but with the input arguments passed in as “query variables”.

To add variables to page component queries, pass these in the `context` object when creating pages.
```
query GetBlogPosts(
  $limit: Int, $filter: MarkdownRemarkFilterInput, $sort: MarkdownRemarkSortInput
) {
	allMarkdownRemark(
    limit: $limit,
    filter: $filter,
    sort: $sort
  ) {
    edges {
      node {
        frontmatter {
          title
          date(formatString: "dddd DD MMMM YYYY")
        }
      }
    }
  }
}
```

### 2-11. Group

**You can also group values on the basis of a field** e.g. the title, date or category and get the field value, the total number of occurrences and edges.

The query below gets us all categories (fieldValue) applied to a book and how many books (totalCount) given category is applied to. In addition we’re grabbing the title of books in given category. You can see for example that there are 3 books in magical creatures category.
```
{
  allMarkdownRemark(filter: {frontmatter: {title: {ne: ""}}}) {
    group(field: frontmatter___categories) {
      fieldValue
      totalCount
      edges {
        node {
          frontmatter {
            title
          }
        }
      }
    }
    nodes {
      frontmatter {
        title
        categories
      }
    }
  }
}
```

### 2-12. Fragments

**Fragments are a way to save frequently used queries for re-use.** To create a fragment, define it in a query and export it as a named export from any file Gatsby is aware of. A fragment is available for use in any other GraphQL query, regardless of location in the project. **Fragments defined in a Gatsby project are global, so names must be unique.**

The query below defines a fragment to get the site title, and then uses the fragment to access this information.
```
fragment fragmentName on Site {
  siteMetadata {
    title
  }
}

{
  site {
    ...fragmentName
  }
}
```


### 2-13. Aliasing

**Want to run two queries on the same datasource? You can do this by aliasing your queries.** See below for an example:
```
{
  someEntries: allMarkdownRemark(skip: 3, limit: 3) {
    edges {
      node {
        frontmatter {
          title
        }
      }
    }
  }
  someMoreEntries: allMarkdownRemark(limit: 3) {
    edges {
      node {
        frontmatter {
          title
        }
      }
    }
  }
}

```
When you use your data, **you will be able to reference it using the alias instead of the root query name.** In this example, that would be data.someEntries or data.someMoreEntries instead of data.allMarkdownRemark.

## Reference

* [https://www.gatsbyjs.org/docs/graphql/](https://www.gatsbyjs.org/docs/graphql/)
