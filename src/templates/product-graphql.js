import React from "react"
import { graphql } from "gatsby"
import Image from "gatsby-image"
export const query = graphql`
  query($slug: String!) {
    productsJson(slug: { eq: $slug }) {
      title
      description
      price
      image
    }
    imageSharp {
      fluid {
        src
        originalImg
        base64
        aspectRatio
        originalName
        presentationHeight
        presentationWidth
        sizes
        srcSet
        srcSetWebp
        srcWebp
        tracedSVG
      }
    }
  }
`
const Product = ({ data }) => {
  const product = data.productsJson
  const sharpImage = data.imageSharp;
  return (
    <div>
      <h1>{product.title}</h1>
      <Image
        fluid={sharpImage.fluid}
        alt={product.title}
        style={{ float: "left", marginRight: "1rem", width: 150 }}
      />
      <p>{product.price}</p>
      <div dangerouslySetInnerHTML={{ __html: product.description }} />
    </div>
  )
}
export default Product