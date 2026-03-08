import React from "react";
import UseTimer from "../components/UseTimer";

const Set = () => {
  const time = new Date();
  time.setSeconds(time.getSeconds() + 150);
  return (
    <div>
      <UseTimer expiryTimestamp={time} />
    </div>
  );
};

export default Set;
