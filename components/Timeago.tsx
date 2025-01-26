"use client";

import ReactTimeago from "react-timeago";

export default function TimeAgo({ date }: { date: string | number | Date }) {
  return <ReactTimeago date={date} />;
}
