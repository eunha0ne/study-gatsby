const path = require(`path`);
const blogPostTemplate = path.resolve(`src/templates/blog-post.js`);

const getResults = (graphql) => {
  return graphql(`
    {
      allProducts: allProductsJson {
        edges {
          node {
            slug
          }
        }
      }
      allMarkdown: allMarkdownRemark(limit: 1000) {
        edges {
          node {
            fields {
              slug
            }
          }
        }
      }
      thirdAPI: swapi {
        allSpecies {
          id
          name
        }
      }
    }
`);
}

exports.createPages = async ({ actions: { createPage }, graphql }) => {
  const results = await getResults(graphql);
  if (results.errors) {
    reporter.panicOnBuild(`Error while running GraphQL query.`)
    return
  }

  results.data.allProducts.edges.forEach(edge => {
    const product = edge.node;
    createPage({
      path: `/gql/${product.slug}`,
      component: require.resolve("./src/templates/product-graphql.js"),
      context: { 
        slug: product.slug,
      },
    });
  });

  // Create pages for each markdown file.
  results.data.allMarkdown.edges.forEach(({ node }) => {
    const path = replacePath(node.fields.slug);
    createPage({
      path,
      component: blogPostTemplate,
      // In your blog post template's graphql query, you can use path
      // as a GraphQL variable to query for data from the markdown file.
      context: {
        slug: node.fields.slug
      }
    })
  });

  results.data.thirdAPI.allSpecies.forEach(({ id, name }) => {
    createPage({
      path: name,
      component: path.resolve(`./src/templates/species.js`),
      context: {
        speciesId: id,
        name: name
      },
    })
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


// Replacing '/' would result in empty string which is invalid
const replacePath = path => (path === `/` ? path : path.replace(/\/$/, ``))
// Implement the Gatsby API “onCreatePage”. This is
// called after every page is created.
exports.onCreatePage = ({ page, actions }) => {
  const { createPage, deletePage } = actions
  const oldPage = Object.assign({}, page)
  // Remove trailing slash unless page is /
  page.path = replacePath(page.path)
  if (page.path !== oldPage.path) {
    // Replace new page with old page
    deletePage(oldPage)
    createPage(page)
  }
}