# GraphQL and Gatsby

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
* 1) run queries against your data in the browser
* 2) dig into the structure of data available to you through a data type explorer.


## 1. Why Gatsby uses GraphQL

### 1-1. Create a page without any data
A common question about Gatsby is, “Why does Gatsby use GraphQL? Doesn’t it generate static files?”

For any kind of pages that aren’t directly created in `src/pages/`, you’ll need Gatsby’s `createPages` `Node API` to create pages programmatically.

All that’s required to create a page is a `path` where it should be created and the component that should be rendered there.

```javascript 
// src/templates/no-data.js
import React from "react"

const NoData = () => (
  <section>
    <h1>This Page Was Created Programmatically</h1>
    <p>
      No data was required to create this page — it’s just a React component!
    </p>
  </section>
)

export default NoData
```

You could programmatically create a page at /no-data/ by adding the following to `gatsby-node.js`:
```javascript
//gatsby-node.js
exports.createPages = ({ actions: { createPage } }) => {
  createPage({
    path: "/no-data/",
    component: require.resolve("./src/templates/no-data.js"),
  })
}
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
  })
}
```

The `context` property accepts an object, and we can pass in any data we want the page to be able to access. When Gatsby creates pages, it includes a prop called `pageContext` and sets its value to `context`, so we can access any of the values in our component:
```javascript
//src/templates/with-context.js
import React from "react"

const WithContext = ({ pageContext }) => (
  <section>
    <h1>{pageContext.title}</h1>
    <div dangerouslySetInnerHTML={{ __html: pageContext.content }} />
  </section>
)

export default WithContext
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
  const products = require("./data/products.json")
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
    })
  })
}
```

The product template still uses pageContext to display the product data:
```jsx
// src/templates/product.js
import React from "react"
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
)
export default Product
```
This gets the job done, but it has a few shortcomings that are going to get more complicated as time goes on:
* The images and the product data are in different places in the source code.
* The image paths are absolute from the built site, not the source code, which makes it confusing to know how to find them from the JSON.
* The images are unoptimized, and any optimization you do would have to be manual.
* To create a preview listing of all products, we’d need to pass all of the product info in context, which will get unweildy as the number of products increases.
* It’s not very obvious where data is coming from in the templates that render the pages, so updating the data might be confusing later.
**To overcome these limitations, Gatsby introduces GraphQL as a data management layer.**

## Reference

* [https://www.gatsbyjs.org/docs/graphql/](https://www.gatsbyjs.org/docs/graphql/)