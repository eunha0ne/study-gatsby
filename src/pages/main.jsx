import React from "react"
import { graphql } from "gatsby"
import IndexPost from "../components/IndexPost.jsx"

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