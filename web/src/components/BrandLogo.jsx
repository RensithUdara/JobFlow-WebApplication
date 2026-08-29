import React from "react";

export function BrandLogo({ large = false }) {
  return (
    <div className={`brand ${large ? "large" : ""}`}>
      {large ? (
        <img className="brand-logo-full" src="/jobflow-logo.png" alt="JobFlow logo" />
      ) : (
        <span className="brand-logo-mark" role="img" aria-label="JobFlow logo" />
      )}
      {!large && (
        <div>
          <h1>JobFlow</h1>
          <span>Queue operations console</span>
        </div>
      )}
    </div>
  );
}
