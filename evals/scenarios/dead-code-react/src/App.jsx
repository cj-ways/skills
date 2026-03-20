import React, { lazy, Suspense } from "react";
import { formatDate } from "./utils";
import { SearchBar } from "./components/SearchBar";

const LazyComponent = lazy(() => import("./components/LazyComponent"));

export default function App() {
  return (
    <div>
      <h1>App</h1>
      <p>Today: {formatDate(new Date())}</p>
      <SearchBar />
      <Suspense fallback={<div>Loading...</div>}>
        <LazyComponent />
      </Suspense>
    </div>
  );
}
