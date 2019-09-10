# GraphQL and Gatsby

> Gatsby의 GraphQL 문서를 정리한 내용을 담고 있습니다.

- [Why Gatsby uses GraphQL](#1-why-gatsby-uses-graphql)
- [Understanding GraphQL Syntax](#2-understanding-graphql-syntax)
- [Introducing GraphiQL](#3-Introducing-GraphiQL)
- [Creating and Modifying Pages](#4-Creating-and-Modifying-Pages)
- [Querying data in pages with GraphQL](#5-Querying-data-in-pages-with-GraphQL)
- [Querying data in components using StaticQuery](#6-Querying-data-in-components-using-StaticQuery)
- [Querying data in components with the useStaticQuery hook](#7-Querying-data-in-components-with-the-useStaticQuery-hook)
- [Using Fragments](#8-Using-Fragments)
- [Creating slugs for pages](#9-Creating-slugs-for-pages)
- [Creating pages from data programatically](#10-Creating-pages-from-data-programatically)
- [Using third-party GraphQL APIs](#11-Using-third-party-GraphQL-APIs)
- [Adding Markdown Pages](#12-Adding-Markdown-Pages)
- [Adding a List of Markdown Blog Posts](#13-Adding-a-List-of-Markdown-Blog-Posts)
- [Using the GraphQL Playground](#14-Using-the-GraphQL-Playground)

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

### Create a page without any data

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

### Create a page with hard-coded data

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

### Create pages from JSON with images

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

### Create pages using GraphQL

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

### Generate pages with GraphQL

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
  `);
  results.data.allProductsJson.edges.forEach(edge => {
    const product = edge.node;
    createPage({
      path: `/gql/${product.slug}/`,
      component: require.resolve("./src/templates/product-graphql.js"),
      context: {
        slug: product.slug,
      },
    });
  });
};
```

You need to use the graphql helper that’s available to the `createPages` Node API to execute the query. To make sure that the result of the query comes back before continuing, use `async`/`await`.

The results that come back are very similar to the contents of data/products.json, so you can loop through the results and create a page for each. However, **note that you’re only passing the slug in context — you’ll use this in the template component to load more product data.**

As you’ve already seen, the context argument is made available to the template component in the pageContext prop. To make queries more powerful, Gatsby also exposes everything in context as a GraphQL variable, which means you can write a query that says, in plain English, “Load data for the product with the slug passed in context.”

```jsx
// src/templates/product-graphql.js
import React from "react";
import { graphql } from "gatsby";
import Image from "gatsby-image";
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
`;
const Product = ({ data }) => {
  const product = data.productsJson;
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
  );
};
export default Product;
```

A few notes about this file:

- The result of the query is added to the template component as the data prop.
- The image path was automatically converted by the Sharp transformer into a “child node” that includes optimized versions of the image.
- The query uses a `[GraphQL fragment](https://www.gatsbyjs.org/packages/gatsby-image/)` to query all the required data for optimized images. GraphQL fragments do not work in the GraphQL Playground.
- The img tag has been swapped out for a gatsby-image component named Image. Instead of a src attribute, it accepts an object with optimized image data.

After the initial setup, loading data with GraphQL is fairly similar to directly loading JSON, but **it provides extra benefits like automatically optimizing images and keeping the data loading in the same place where it’s used.**

GraphQL is certainly not required, but the benefits of adopting GraphQL are significant. **GraphQL will simplify the process of building and optimizing your pages**, so it’s considered a best practice for structuring and writing Gatsby applications.

## 2. Understanding GraphQL Syntax

### Basic query

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

### A longer query

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

### Limit

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

### Skip

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

### Filter

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

### Complete list of possible operators

- eq: short for equal, must match the given data exactly
- ne: short for not equal, must be different from the given data
- regex: short for regular expression, must match the given pattern. **Note that backslashes need to be escaped twice**, so `/\w+/` needs to be written as `"/\\\\w+/"`.
- glob: short for global, allows to use wildcard `*` which acts as a placeholder for any non-empty string
- in: short for in array, must be an element of the array
- nin: short for not in array, must NOT be an element of the array
- gt: short for greater than, must be greater than given value
- gte: short for greater than or equal, must be greater than or equal to given value
- lt: short for less than, must be less than given value
- lte: short for less than or equal, must be less than or equal to given value
- elemMatch: short for element match, this indicates that the field you are filtering will return an array of elements, on which you can apply a filter using the previous operators

### Sort

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

### Format

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

### Sort, filter, limit & format together

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

### Query variables

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

### Group

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

### Fragments

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

### Aliasing

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

## 3. Introducing GraphiQL

GraphiQL is the GraphQL integrated development environment (IDE). It’s a powerful (and all-around awesome) tool you’ll use often while building Gatsby websites.

When the development server is running for one of your Gatsby sites, open GraphiQL at http://localhost:8000/___graphql and play with your data! Press `Ctrl + Space` (or use `Shift + Space` as an alternate keyboard shortcut) to bring up the autocomplete window and `Ctrl + Enter` to run the GraphQL query.

## 4. Creating and Modifying Pages

Pages can be created in three ways:

- In your site’s gatsby-node.js by implementing the API `createPages`
- Gatsby core automatically turns React components in `src/pages` into pages
- Plugins can also implement `createPages` and create pages for you

You can also implement the API `onCreatePage` to modify pages created in core or plugins or to create client-only routes.

### Debugging help

To see what pages are being created by your code or plugins, you can query for page information while developing in GraphiQL.

```
Copycopy code to clipboard
{
  allSitePage {
    edges {
      node {
        path
        component
        pluginCreator {
          name
          pluginFilepath
        }
      }
    }
  }
}
```

### Createing Pages in gatsby-node.js

Often you will need to programmatically create pages. For example, you have markdown files where each should be a page. This example assumes that each markdown page has a path set in the frontmatter of the markdown file.

```js
// Implement the Gatsby API “createPages”. This is called once the
// data layer is bootstrapped to let plugins create pages from data.
exports.createPages = async ({ graphql, actions, reporter }) => {
  const { createPage } = actions;
  // Query for markdown nodes to use in creating pages.
  const result = await graphql(
    `
      {
        allMarkdownRemark(limit: 1000) {
          edges {
            node {
              frontmatter {
                path
              }
            }
          }
        }
      }
    `
  );
  // Handle errors
  if (result.errors) {
    reporter.panicOnBuild(`Error while running GraphQL query.`);
    return;
  }
  // Create pages for each markdown file.
  const blogPostTemplate = path.resolve(`src/templates/blog-post.js`);
  result.data.allMarkdownRemark.edges.forEach(({ node }) => {
    const path = node.frontmatter.path;
    createPage({
      path,
      component: blogPostTemplate,
      // In your blog post template's graphql query, you can use path
      // as a GraphQL variable to query for data from the markdown file.
      context: {
        path,
      },
    });
  });
};

const { createFilePath } = require(`gatsby-source-filesystem`);
exports.onCreateNode = ({ node, getNode, actions }) => {
  const { createNodeField } = actions;

  if (node.internal.type === `MarkdownRemark`) {
    const slug = createFilePath({ node, getNode, basePath: `pages` });
    createNodeField({
      node,
      name: `slug`,
      value: slug,
    });
  }
};
```

### Modifying pages created by core or plugins

Gatsby core and plugins can automatically create pages for you. Sometimes the default isn’t quite what you want and you need to modify the created page objects.

#### Removing trailing slashes

A common reason for needing to modify automatically created pages is to remove trailing slashes. (Note: There’s also a plugin that will remove all trailing slashes from pages automatically: gatsby-plugin-remove-trailing-slashes.)

#### Pass context to pages

The automatically created pages can receive context and use that as variables in their GraphQL queries. To override the default and pass your own context, open your site’s gatsby-node.js and add similar to the following:

```js
exports.onCreatePage = ({ page, actions }) => {
  const { createPage, deletePage } = actions;
  deletePage(page);
  // You can access the variable "house" in your page queries now
  createPage({
    ...page,
    context: {
      ...page.context,
      house: `Gryffindor`,
    },
  });
};
```

On your pages and templates, you can access your context via the prop pageContext like this:

```jsx
import React from "react";
const Page = ({ pageContext }) => {
  return <div>{pageContext.house}</div>;
};
export default Page;
```

Page context is serialized before being passed to pages: This means it can’t be used to pass functions into components.

## 5 Querying data in pages with graphQL

Gatsby’s graphql tag enables page components to retrieve data via a GraphQL query.

### How to use the `graphql` tag in pages

#### Add description to siteMetadata

```js
module.exports = {
  siteMetadata: {
    title: "My Homepage",
    description: "This is where I write my thoughts.",
  },
};

// src/pages/index.js
import React from "react";
const HomePage = () => {
  return <div>Hello!</div>;
};
export default HomePage;
```

#### Add the graphql query

Below our HomePage component declaration, export a new constant called `query`, and set its value to be a graphql tagged template with the query between two backticks:

```js
export const query = graphql`
  query HomePageQuery {
    site {
      siteMetadata {
        description
      }
    }
  }
`;
```

#### Provide data to the component

```js
const HomePage = ({ data }) => {
  return <div>{data.site.siteMetadata.description}</div>;
};
```

## 6. Querying data in components using StaticQuery

Gatsby v2 introduces `StaticQuery`, a new API that allows components to retrieve data via GraphQL query.

```js
// src/components/header.js
import React from "react";
import { StaticQuery, graphql } from "gatsby";
export default () => (
  <StaticQuery
    query={graphql`
      query HeadingQuery {
        site {
          siteMetadata {
            title
          }
        }
      }
    `}
    render={data => (
      <header>
        <h1>{data.site.siteMetadata.title}</h1>
      </header>
    )}
  />
);
```

**Using `StaticQuery`, you can colocate a component with its data. No longer is it required to, say, pass data down from Layout to Header.**

### typechecking

With the above pattern, you lose the ability to typecheck with PropTypes. To regain typechecking while achieving the same result, you can change the component to:

```js
import React from "react";
import { StaticQuery, graphql } from "gatsby";
import PropTypes from "prop-types";

const Header = ({ data }) => (
  <header>
    <h1>{data.site.siteMetadata.title}</h1>
  </header>
);

export default props => (
  <StaticQuery
    query={graphql`
      query {
        site {
          siteMetadata {
            title
          }
        }
      }
    `}
    render={data => <Header data={data} {...props} />}
  />
);

Header.propTypes = {
  data: PropTypes.shape({
    site: PropTypes.shape({
      siteMetadata: PropTypes.shape({
        title: PropTypes.string.isRequired,
      }).isRequired,
    }).isRequired,
  }).isRequired,
};
```

### How StaticQuery differs from page query

StaticQuery can do most of the things that page query can, including fragments. The main differences are:

- page queries can accept variables (via pageContext) but can only be added to page components
- StaticQuery does not accept variables (hence the name “static”), but can be used in any component, including pages
- StaticQuery does not work with raw React.createElement calls; please use JSX, e.g. <StaticQuery />

## 7. Querying data in components with the useStaticQuery hook

Gatsby v2.1.0 introduces useStaticQuery, a new Gatsby feature that provides the ability to use a [`React Hook`](https://reactjs.org/docs/hooks-intro.html) to query with GraphQL at build time.

```bash
# You’ll need React and ReactDOM 16.8.0 or later to use useStaticQuery
npm install react@^16.8.0 react-dom@^16.8.0
```

useStaticQuery is a React Hook. All the Rules of Hooks apply. **It takes your GraphQL query and returns the requested data.**

```js
import React from "react";
import { useStaticQuery, graphql } from "gatsby";
export default () => {
  const data = useStaticQuery(graphql`
    query HeaderQuery {
      site {
        siteMetadata {
          title
        }
      }
    }
  `);
  return (
    <header>
      <h1>{data.site.siteMetadata.title}</h1>
    </header>
  );
};
```

### Composing custom `useStaticQuery` hooks

One of the most compelling(강력한) features of hooks is the ability to compose and re-use these blocks of functionality. useStaticQuery is a hook. Therefore, **using useStaticQuery allows us to compose and re-use blocks of reusable functionality.** Perfect!

```js
import { useStaticQuery, graphql } from "gatsby";
export const useSiteMetadata = () => {
  const { site } = useStaticQuery(
    graphql`
      query SiteMetaData {
        site {
          siteMetadata {
            siteUrl
            headline
            description
            image
            video
            twitter
            name
            logo
          }
        }
      }
    `
  );
  return site.siteMetadata;
};
```

### Known Limitations

- `useStaticQuery` does not accept variables (hence the name “static”), but can be used in any component, including pages
- Because of how queries currently work in Gatsby, we support only a single instance of useStaticQuery in a file

## 8. Using fragments

Fragments allow you to reuse parts of GraphQL queries. It also allows you to split up complex queries into smaller, easier to understand components.

### The building blocks of a fragment

```
fragment FragmentName on TypeName {
  field1
  field2
}
```

- `FragmentName`: the name of the fragment that will be referenced later.
- `TypeName`: the [GraphQL type](https://graphql.org/graphql-js/object-types/) of the object the fragment will be used on. This is important because you can only query for fields that actually exist on a given object.
- The body of the query. You can define any fields with any level of nesting in here, the same that you would elsewhere in a GraphQL query

### Creating and using a fragment

A fragment can be created inside any GraphQL query, but it’s good practice to create the query separately. More organization advice in the [Conceptual Guide](https://www.gatsbyjs.org/docs/querying-with-graphql/#fragments)

```jsx
// src/components/IndexPost.jsx
import React from "react"
import { graphql } from "gatsby"
export default ( props ) => {
  return (...)
}
export const query = graphql`
  fragment SiteInformation on Site {
    siteMetadata {
      title
      siteDescription
    }
  }
`
// src/pages/main.jsx
import React from "react"
import { graphql } from "gatsby"
import IndexPost from "../components/IndexPost"
export default ({ data }) => {
  return (
    <div>
      <h1>{data.site.siteMetadata.title}</h1>
      <p>{data.site.siteMetadata.siteDescription}</p>
      {/*
        Or you can pass all the data from the fragment
        back to the component that defined it
      */}
      <IndexPost siteInformation={data.site.siteMetadata} />
    </div>
  )
}
export const query = graphql`
  query {
    site {
      ...SiteInformation
    }
  }
`

```

When compiling your site, Gatsby preprocesses all GraphQL queries it finds. Therefore, any file that gets included in your project can define a snippet. However, **only Pages can define GraphQL queries that actually return data. This is why we can define the fragment in the component file** - it doesn’t actually return any data directly.

## 9. Creating slugs for pages

```bash
npm install --save gatsby-source-filesystem
```

Add your new slugs directly onto the `MarkdownRemark` nodes. Any data you add to nodes is available to query later with GraphQL. To do so, you’ll use a function passed to our API implementation called `createNodeField`. This function allows you to create additional fields on nodes created by other plugins.

```js
const { createFilePath } = require(`gatsby-source-filesystem`);
exports.onCreateNode = ({ node, getNode, actions }) => {
  const { createNodeField } = actions;
  if (node.internal.type === `MarkdownRemark`) {
    const slug = createFilePath({ node, getNode, basePath: `pages` });
    createNodeField({
      node,
      name: `slug`,
      value: slug,
    });
  }
};
```

```
{
  allMarkdownRemark {
    edges {
      node {
        fields {
          slug
        }
      }
    }
  }
}
```

## 10. Creating pages from data programatically

Gatsby and its ecosystem of plugins provide all kinds of data through a GraphQL interface.

### creating pages

The Gatsby Node API provides the `createPages` extension point which we’ll use to add pages. This function will give us access to the `createPage` action which is at the core of programmatically creating a page.

```js
exports.createPages = async function({ actions, graphql }) {
  const { data } = await graphql(`
    query {
      allMarkdownRemark {
        edges {
          node {
            fields {
              slug
            }
          }
        }
      }
    }
  `);
  data.allMarkdownRemark.edges.forEach(edge => {
    const slug = edge.node.fields.slug;
    actions.createPage({
      path: slug,
      component: require.resolve(`./src/templates/blog-post.js`),
      context: { slug: slug },
    });
  });
};
```

For each page we want to create **we must specify the `path` for visiting that page, the component template used to render that page, and any context we need in the component for rendering.**

**The `context` parameter is optional**, though often times it will include a unique identifier that can be used to query for associated data that will be rendered to the page. **All context values are made available to a template’s GraphQL queries as arguments prefaced with \$**, so from our example above the slug property will become the \$slug argument in our page query:

```js
export const query = graphql`
  query($slug: String!) {
    ...
  }
```

### Specifying a template

The `createPage` action required that we specify the component template that will be used to render the page.

```js
import React from "react";
import { graphql } from "gatsby";
import Layout from "../components/layout";
export default ({ data }) => {
  const post = data.markdownRemark;
  return (
    <Layout>
      <div>
        <h1>{post.frontmatter.title}</h1>
        <div dangerouslySetInnerHTML={{ __html: post.html }} />
      </div>
    </Layout>
  );
};
export const query = graphql`
  query($slug: String!) {
    markdownRemark(fields: { slug: { eq: $slug } }) {
      html
      frontmatter {
        title
      }
    }
  }
`;
```

Notice that **we’re able to query with the \$slug value from our context as an argument, which ensures that we’re returning only the data that matches that specific page.** As a result we can provide the title and html from the matching markdownRemark record to our component. The context values are also available as the pageContext prop in the template component itself.

The `gatsby-transformer-remark` plugin is just one of a multitude of **Gatsby plugins that can provide data through the GraphQL interface. Any of that data can be used to programmatically create pages.**

## 11. Using third-party GraphQL APIs

```shell
npm install gatsby-source-graphql
```

rovided there is a GraphQL API under a `url`, adding it to an API just requires adding this to the config.

```js
// gatsby-config.js

module.exports = {
  plugins: [
    {
      resolve: "gatsby-source-graphql",
      options: {
        // This type will contain remote schema Query type
        typeName: "SWAPI",
        // This is the field under which it's accessible
        fieldName: "swapi",
        // URL to query from
        url: "https://api.graphcms.com/simple/v1/swapi",
      },
    },
  ],
};
```

See all configuration options in the [plugin docs](https://www.gatsbyjs.org/packages/gatsby-source-graphql). Third-party APIs will be available under the `fieldName` specified, so you can query through it normally.

```bash
{
  # Field name parameter defines how you can access a third-party API
  swapi {
    allSpecies {
      name
    }
  }
}

# Note that types of the third-party API will be prefixed with ${typeName}_. You need to prefix it too, eg when using variables or fragments.

{
  # Field name parameter defines how you can access third-party API
  swapi {
    allSpecies {
      ... on SWAPI_Species {
        name
      }
    }
  }
}
```

### Creating pages dynamically through third-party APIs

You can also create pages dynamically by adding a `createPages` callback in `gatsby-node.js`. For example you can create a page for every Star Wars species.

```js
// gatsby-node.js

const path = require(`path`);
exports.createPages = async ({ actions, graphql }) => {
  const { data } = await graphql(`
    query {
      swapi {
        allSpecies {
          id
          name
        }
      }
    }
  `);
  data.swapi.allSpecies.forEach(({ id, name }) => {
    actions.createPage({
      path: name,
      component: path.resolve(`./src/components/Species.js`),
      context: {
        speciesId: id,
      },
    });
  });
};
```

## 12. Adding Markdown Pages

Gatsby can use Markdown files to create pages in your site. You add plugins to read and understand folders with Markdown files and from them create pages automatically. Here are the steps Gatsby follows for making this happen.

1. Read files into Gatsby from the filesystem
2. Transform Markdown to HTML and `frontmatter` to data
3. Add a Markdown file
4. Create a page component for the Markdown files
5. Create static pages using Gatsby’s Node.js `createPage` API

### Read files into Gatsby from the filesystem

```bash
npm install --save gatsby-source-filesystem
```

Open gatsby-config.js to add the `gatsby-source-filesystem` plugin. Now pass the object from the next block to the `plugins` array. By passing an object that includes the key path, you set the file system path.

```js
plugins: [
  {
    resolve: `gatsby-source-filesystem`,
    options: {
      name: `markdown-pages`,
      path: `${__dirname}/src/markdown-pages`,
    },
  },
];
```

Completing the above step means that you’ve “sourced” the Markdown files from the filesystem. You can now “transform” the Markdown to HTML and the YAML frontmatter to JSON.

### Transform Markdown to HTML and frontmatter to data using `gatsby-transformer-remark`

You’ll **use the plugin gatsby-transformer-remark to recognize files which are Markdown and read their content.** The plugin will convert the frontmatter metadata part of your Markdown files as frontmatter and the content part as HTML.

```bash
npm install --save gatsby-transformer-remark
```

Add this to gatsby-config.js after the previously added gatsby-source-filesystem.

```js
plugins: [
  {
    resolve: `gatsby-source-filesystem`,
    options: {
      path: `${__dirname}/src/markdown-pages`,
      name: `markdown-pages`,
    },
  },
  `gatsby-transformer-remark`,
];
```

### add a Markdown file

When you create a Markdown file, yo**u can include a set of key value pairs that can be used to provide additional data relevant to specific pages in the GraphQL data layer. This data is called frontmatter** and is denoted by the triple dashes at the start and end of the block. This block will be parsed by `gatsby-transformer-remark` as `frontmatter`. The GraphQL API will provide the key value pairs as data in our React components.

```md
---
path: "/blog/my-first-post"
date: "2019-05-04"
title: "My first blog post"
---
```

What is important in this step is the key pair `path`. The value that is assigned to the key path is used in order to navigate to your post.

### Create a page template for the Markdown files

Create a folder in the /src directory of your Gatsby application called templates. Now create a blogTemplate.js inside it with the following content:

```js
import React from "react";
import { graphql } from "gatsby";
export default function Template({
  data, // this prop will be injected by the GraphQL query below.
}) {
  const { markdownRemark } = data; // data.markdownRemark holds our post data
  const { frontmatter, html } = markdownRemark;
  return (
    <div className="blog-post-container">
      <div className="blog-post">
        <h1>{frontmatter.title}</h1>
        <h2>{frontmatter.date}</h2>
        <div
          className="blog-post-content"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </div>
  );
}
export const pageQuery = graphql`
  query($path: String!) {
    markdownRemark(frontmatter: { path: { eq: $path } }) {
      html
      frontmatter {
        date(formatString: "MMMM DD, YYYY")
        path
        title
      }
    }
  }
`;
```

Two things are important in the file above:

1. A GraphQL query is made in the second half of the file to get the Markdown data. Gatsby has automagically given you all the Markdown metadata and HTML in this query’s result.
2. The result of the query is injected by Gatsby into the Template component as data. markdownRemark is the property that you’ll find has all the details of the Markdown file. You can use that to construct a template for our blog post view. Since it’s a React component, you could style it with any of the recommended styling systems in Gatsby.

### Create static pages using Gatsby’s Node.js `createPage` API

Use the `graphql` to query Markdown file data as below. Next, use the `createPage` action creator to create a page for each of the Markdown files using the `blogTemplate.js` you created in the previous step.

```js
const path = require(`path`);
exports.createPages = async ({ actions, graphql, reporter }) => {
  const { createPage } = actions;
  const blogPostTemplate = path.resolve(`src/templates/blogTemplate.js`);
  const result = await graphql(`
    {
      allMarkdownRemark(
        sort: { order: DESC, fields: [frontmatter___date] }
        limit: 1000
      ) {
        edges {
          node {
            frontmatter {
              path
            }
          }
        }
      }
    }
  `);
  // Handle errors
  if (result.errors) {
    reporter.panicOnBuild(`Error while running GraphQL query.`);
    return;
  }
  result.data.allMarkdownRemark.edges.forEach(({ node }) => {
    createPage({
      path: node.frontmatter.path,
      component: blogPostTemplate,
      context: {}, // additional data can be passed via context
    });
  });
};
```

## 13. Adding a List of Markdown Blog Posts

As described previous section, you will have to create your posts in Markdown files which will look like this:

```md
---
path: "/blog/my-first-post"
date: "2017-11-07"
title: "My first blog post"
---

Has anyone heard about GatsbyJS yet?
```

### Creating the page

The first step will be to create the page which will display your posts, in src/pages/. You can for example use index.js.

```js
import React from "react";
import PostLink from "../components/post-link";
const IndexPage = ({
  data: {
    allMarkdownRemark: { edges },
  },
}) => {
  const Posts = edges
    .filter(edge => !!edge.node.frontmatter.date) // You can filter your posts based on some criteria
    .map(edge => <PostLink key={edge.node.id} post={edge.node} />);
  return <div>{Posts}</div>;
};
export default IndexPage;
```

### Creating the GraphQl Query

```js
import React from "react";
import { graphql } from "gatsby";
import PostLink from "../components/post-link";
const IndexPage = ({
  data: {
    allMarkdownRemark: { edges },
  },
}) => {
  const Posts = edges
    .filter(edge => !!edge.node.frontmatter.date) // You can filter your posts based on some criteria
    .map(edge => <PostLink key={edge.node.id} post={edge.node} />);
  return <div>{Posts}</div>;
};
export default IndexPage;
export const pageQuery = graphql`
  query {
    allMarkdownRemark(sort: { order: DESC, fields: [frontmatter___date] }) {
      edges {
        node {
          id
          excerpt(pruneLength: 250)
          frontmatter {
            date(formatString: "MMMM DD, YYYY")
            path
            title
          }
        }
      }
    }
  }
`;
```

### Creating the PostLink componetn

```js
import React from "react";
import { Link } from "gatsby";
const PostLink = ({ post }) => (
  <div>
    <Link to={post.frontmatter.path}>
      {post.frontmatter.title} ({post.frontmatter.date})
    </Link>
  </div>
);
export default PostLink;
```

This should get you a page with your posts sorted by descending date. You can further customize the frontmatter and the page and PostLink components to get your desired effects!

## 14. Using the GraphQL Playground

An alternative to the current IDE for your GraphQL queries: [GraphQL Playground](https://github.com/prisma/graphql-playground). To access this experimental feature utilizing GraphQL Playground with Gatsby, add GATSBY_GRAPHQL_IDE to your develop script in your package.json, like this:

```js
"develop": "GATSBY_GRAPHQL_IDE=playground gatsby develop",
```

To still be able to use `gatsby develop` you would require the dotenv package to your gatsby-config.js file and add an [environment variable](https://www.gatsbyjs.org/docs/environment-variables/) file, typically called `.env.development`. Finally, add `GATSBY_GRAPHQL_IDE=playground` to the `.env.development` file.

## Reference

- [https://www.gatsbyjs.org/docs/graphql/](https://www.gatsbyjs.org/docs/graphql/)
