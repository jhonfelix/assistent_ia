"use client";

import React from "react";
import ChatHome from "./examples/basic-chat/page"

const Home = () => {
  const categories = {
    "Basic chat": "basic-chat",

  };

  return (
    <main>
      <ChatHome />
    </main>
  );
};

export default Home;
