import React from "react";
import PropTypes from "prop-types";

export default function WidgetCard({ title, children, style = {} }) {
  return (
    <div
      className="rounded-2xl shadow-md p-4 bg-white flex flex-col justify-between transition hover:shadow-lg"
      style={style}
    >
      {title && (
        <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
      )}
      <div className="flex-1">{children}</div>
    </div>
  );
}

WidgetCard.propTypes = {
  title: PropTypes.string,
  children: PropTypes.node.isRequired,
  style: PropTypes.object,
};
