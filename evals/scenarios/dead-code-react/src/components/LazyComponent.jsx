import React from "react";

// SAFE: dynamically imported via React.lazy in App.jsx
export default function LazyComponent() {
  return <div>I am lazily loaded</div>;
}
