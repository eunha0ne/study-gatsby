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

<br>
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

