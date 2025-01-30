"use client";

import React from "react";
import styles from "./page.module.css";
import ChatHome from "./examples/basic-chat/page"

const Home = () => {
  const categories = {
    "Basic chat": "basic-chat",
    /*"Function calling": "function-calling",
    "File search": "file-search",
    All: "all",*/
  };

  return (
    <main>
      <ChatHome />
    </main>
  );
};

export default Home;
