import React from "react"
import { useSiteMetadata } from "../hooks/use-site-metadata"

export default () => {
  const { title, description } = useSiteMetadata();
  return (
    <header>
      <h1>welcome to {title}</h1>
      <p>{description}</p>
    </header>
  );
}