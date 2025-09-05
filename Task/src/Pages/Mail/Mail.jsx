import React from "react";

const Mail = ({ height = "800px" }) => {
  return (
    <div className="w-full h-full">
      <iframe
        src="http://immortal.herosite.pro:2096/"
        width="100%"
        height={height}
        style={{ border: "none" }}
        title="MilesWeb Mail"
        sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
      />
      <p className="text-center text-gray-500 text-sm mt-2">
        If the mail client doesn’t load,{" "}
        <a
          href="http://immortal.herosite.pro:2096/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline"
        >
          click here to open Webmail
        </a>
        .
      </p>
    </div>
  );
};

export default Mail;
