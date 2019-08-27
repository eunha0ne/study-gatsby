import React from "react"
import { graphql } from "gatsby"

export default ( props ) => {
  console.log('props', props);
  return  (
    <div>
      <h3>
        <span>{props.siteInformation.title}</span>
        <p>{props.siteInformation.description}</p>
      </h3>
    </div>
  )
}
export const query = graphql`
  fragment SiteInformation on Site {
    siteMetadata {
      title
      description
    }
  }
`