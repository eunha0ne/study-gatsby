import React from "react";
import { graphql } from "gatsby";

export const query = graphql`
  query($slug: String!) {
    markdownRemark(fields: { slug: { eq: $slug } }) {
      html
      frontmatter {
        title
        tags
        date(formatString: "DD MMMM, YYYY")
      }
      headings {
        value
        depth
      }
    }
  }
`;

export default ({ data, pageContext }) => {
  return (
    <article>
      <h2>{data.markdownRemark.frontmatter.title}</h2>
      <p>{pageContext.slug}</p>
    </article>
  );
};