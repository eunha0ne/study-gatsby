import React from "react";

const Product = ({ pageContext }) => {
  console.log('data', pageContext);
  return (
    <header>
      <h1>{pageContext.name}</h1>
      <p>{pageContext.speciesId}</p>
    </header>
  );
}



export default Product;
