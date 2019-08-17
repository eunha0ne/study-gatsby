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
Copycopy code to clipboard
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